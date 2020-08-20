#!/usr/bin/env python
import datetime
import warnings
import numpy as np
import os
import sys
import math
import time
import fnmatch
from subprocess import call
import netCDF4 as nc
import matplotlib as mpl

mpl.use('Agg')  # necessary when there is no xserver avail

import matplotlib.pyplot as plt
from matplotlib.ticker import MaxNLocator
from matplotlib.ticker import FormatStrFormatter
import seaborn as sns
sns.set_style("white")
sns.set_style("ticks")
sns.set_context(rc={
    "lines.linewidth": 1,
    "legend.frameon": True
})

__author__ = "scodresc"

'''
plotter.py

This is script is responsible for making the static pre generated plots for the
dscovr web site. Most options are configurable from the configuration block at
the top of this file. See inline comments for specifics.
'''

# config -------------------------------
# y, m, d, MUST MATCH WEB START DATE, first day of plotting
dscovr_mission_start = datetime.datetime(2016, 07, 26)

# Tell the plotter how to find data files.
# ASSUMES: files are organized into month directories. find_file and find_files_for_month need
# adjustment if this changes
dscovr_file_base = '/nfs/dscovr_public/data/'  # base of the data files
dscovr_path_from_base = '%Y/%m/'  # path between base and files, !!!use STRFTIME format!!!
dscovr_day_file_pattern = "oe_%%s_dscovr_s%Y%m%d000000_e%Y%m%d235959_p*"  # patten for files !!!use STRFTIME format!!!
dscovr_month_file_pattern = "oe_%s_dscovr_*"  # pattern for month files, !!! NOT strftime format !!!
# Note the %%s, which will escape the %s going through STRFTIME so we can format the product name into that
# filename = strftime("%%s", date) % product === "product" is the gist

# where to put the finished plots?
dscovr_plot_output_base = '/nfs/dscovr_public/plots/'

# are the files in /data/ gszipped?
dscovr_files_gzipped = True

dscovr_attribution_text = 'Courtesy of NCEI, CO - ngdc.noaa.gov/dscovr'
dscovr_ts_width = 14  # plot width in inches
dscovr_ts_height = 10  # inches

# if you add a new frame type, make sure startof_frame handles it!
dscovr_ts_frame_sizes = [
    # name       #path                      #filename           #startms             #finishms
    ["6hour1",  "dscovr_6hr_plots/%Y/%m",   "%Y%m%d00-6hr",     0,                   1000 * 60 * 60 * 6],
    ["6hour2",  "dscovr_6hr_plots/%Y/%m",   "%Y%m%d06-6hr",     1000 * 60 * 60 * 6,  1000 * 60 * 60 * 12],
    ["6hour3",  "dscovr_6hr_plots/%Y/%m",   "%Y%m%d12-6hr",     1000 * 60 * 60 * 12, 1000 * 60 * 60 * 18],
    ["6hour4",  "dscovr_6hr_plots/%Y/%m",   "%Y%m%d18-6hr",     1000 * 60 * 60 * 18, 1000 * 60 * 60 * 24],
    ["1day",    "dscovr_1day_plots/%Y/%m",  "%Y%m%d-day",       0,                   1000 * 60 * 60 * 24],
    ["3day",    "dscovr_3day_plots/%Y/",    "%Y%m%d-3day",      0,                   1000 * 60 * 60 * 24 * 3],
    ["7day",    "dscovr_7day_plots/%Y/",    "%Y%m%d-7day",      0,                   1000 * 60 * 60 * 24 * 7],
    ["1month",  "dscovr_month_plots/%Y/",   "%Y%m-month",       0,                   0]
    # month is going to to take a custom range, months not all same length
]


# LIMITATIONS! Can only have one lambda block per panel, and can only have one lambda stroke per lambda block.
# a lambda config block to calculate dynamic_pressure.
dscovr_dynamic_pressure_config = (
    ["f1m:proton_density", "f1m:proton_speed"],  # these are the arugments for the lambda
    lambda nprot, vprot: 2e-6*nprot*vprot**2,  # dynamic pressure approximation
    "approx. dynamic_pressure", "#2E41FF"  # legend label, and color
)


dscovr_ts_pane_config = [
    # each row of the config should look like one of the two lines
    # "y label", [quiet scale, storm scale],[ ["prod", "var", "label", "color"], ... ]
    # ... can optionally specify a lambda block in which case the structure is
    # ["second y label", [quiet_scale, storm_scale], lambda_block]
    # where a lambda block is a 4 tuple containing
    # (["data:key1", "data:key2"], lambda data1, data2: ___, "legend label", color)

    # prod and data are three letter product codes which will be used to find the files for the data, eg m1m
    # var and key are the variable in the product netcdf, eg, inside m1m there is a variable bx_gse
    # quiet scale and storm scale are each a len 2 list specifying y axis range under normal and storm conditions
    # if the max data point is above quiet scale, storm scale will be used instead
    ["Mag   [nT]", [[-16, 16], [-50, 50]], [
        ["m1m", "bx_gsm", "bx_gsm", "#2E41FF"],
        ["m1m", "by_gsm", "by_gsm", "#2EBF41"],
        ["m1m", "bz_gsm", "bz_gsm", "#E8080B"],
        ["m1m", "bt", "bt", "black"]
    ]],
    ["Density   [cm^-3]", [[0, 50], [0, 100]], [
        ["f1m", "proton_density", "proton_density", "#FFA631"],
        ["Dynamic Pressure   [nPa]", [[0, 6], [0, 15]], dscovr_dynamic_pressure_config],
    ]],
    ["Speed   [km/s]", [[200, 600], [200, 1300]], [["f1m", "proton_speed", "proton_speed", "#AB69C6"]]],
    ["Temperature   [K]", [[10e2, 10e6], [10e2, 10e7]], [["f1m", "proton_temperature", "proton_temperature", "#2EBF41"]]],
    # NOTE: temperature is hardcoded w/ a semilogy scale in the make_plot function
]

##########################################

dscovr_ts_panes = len(dscovr_ts_pane_config)  # number of panes

# additional imports needed to handle gzipped files
if dscovr_files_gzipped:
    import tempfile
    import gzip
    import shutil


def find_file(dt, product):
    """Since the processing time is unknown, use the type and the date to
    make a string like it_m1m_dscovr_s(date)_e(date)_p*_pub.nc and pattern match
    to fill in the processing date p*
    Assumes day files.
    Returns first match.
    :type dt: datetime.datetime
    :param dt: Date of day file wanted
    :type product: str
    :param product: find file of this product type
    :rtype: str
    :return: filename of product on date requested
    """
    seek_path_full = os.path.join(dscovr_file_base, dt.strftime(dscovr_path_from_base))
    seek_filename = dt.strftime(dscovr_day_file_pattern) % product
    for root, dirs, files in os.walk(seek_path_full):
        for name in files:
            if fnmatch.fnmatch(name, seek_filename):
                return os.path.join(root, name)


def find_files_for_month(dt, product):
    """Since the processing time is unknown, use the type and the date to
    make a string like it_m1m_dscovr_s(date)_e(date)_p*_pub.nc and pattern match
    to fill in the processing date p*
    :type dt: datetime.datetime
    :param dt: date of day file wanted
    :type product: str
    :param product: find files of this product type
    :rtype: list
    :return: filenames of products in month
    """
    results = []
    seek_path_full = os.path.join(dscovr_file_base, dt.strftime(dscovr_path_from_base))
    seek_filename = dscovr_month_file_pattern % product
    for root, dirs, files in os.walk(seek_path_full):
        for name in files:
            if fnmatch.fnmatch(name, seek_filename):
                results.append(os.path.join(root, name))
    return results


def gunzip_files_to_tmp(files):
    """
    Given a list of gzipped filenames as files, gunzip each to a temporary file
    and return the list of temporary files.
    :type files: list
    :param files: list of strings of gzipped filenames
    :rtype: list
    :return: list of temporary files containing unzipped copies of files
    """
    degz_files = []
    for each in files:
        tmp_path = tempfile.NamedTemporaryFile(mode="w+b", delete=False)
        shutil.copyfileobj(gzip.open(each), tmp_path)
        degz_files.append(tmp_path.name)
    return degz_files


def netcdf4_to_netcdf3_classic(files, delete=False):
    """

    :type files: list
    :param files: list of strings of netcdf4 files
    :type delete: bool
    :param delete: if true, delete the original netcdf4 files, useful when they are tmpfiles
    :rtype: list
    :return: list of temporary netcdf3 files
    """
    classic_files = []
    for each in files:
        tmp_path = tempfile.NamedTemporaryFile(mode="w+b", delete=False)
        call(["nccopy", "-k", "classic", each, tmp_path.name])
        classic_files.append(tmp_path.name)
    if delete:
        rm_files(files)
    return classic_files


def rm_files(files):
    """
    Delete each of the files in the list of files given as the argument.
    :type files: list
    :param files: list of files to be deleted
    :return: None
    """
    for each in files:
        os.remove(each)


def unix_time_millis(dt):
    """
    Convert the given date dt to milliseconds.
    :type dt: datetime.datetime
    :param dt: datetime date to convert to ms
    :rtype: int
    :return: Milliseconds since 1970, or unix time stamp in ms
    """
    epoch = datetime.datetime.utcfromtimestamp(0)
    delta = dt - epoch
    return int(delta.total_seconds() * 1000)

def millis_to_dt(millis):
    """
    Convert a milliseconds since unix epoch to a datetime object.
    :param millis: milliseconds since unix epoch
    :rtype: datetime.datetime
    :return: datetime object from millis
    """
    return datetime.datetime.utcfromtimestamp(millis / 1000)


def startof_frame(dt, frame_type):
    """
    Calculate the start datetime of the frame which dt falls inside of.
    :type dt: datetime.datetime
    :param dt: instance for which we want the beginning of corresponding frame
    :type frame_type: str
    :param frame_type: the type of frame we want the start of
    :rtype: datetime.datetime
    :return: start datetime of the frame dt belongs inside.
    """
    if frame_type == "3day":
        ms_in_3_days = 1000 * 60 * 60 * 24 * 3
        mission_start_in_ms = unix_time_millis(dscovr_mission_start)
        dt_in_ms = unix_time_millis(dt)
        offset = dt_in_ms - mission_start_in_ms
        ms_of_period = mission_start_in_ms + ms_in_3_days * math.floor(offset / ms_in_3_days)
        return datetime.datetime.utcfromtimestamp(ms_of_period / 1000)
    elif frame_type == "7day":
        ms_in_7_days = 1000 * 60 * 60 * 24 * 7
        mission_start_in_ms = unix_time_millis(dscovr_mission_start)
        dt_in_ms = unix_time_millis(dt)
        offset = dt_in_ms - mission_start_in_ms
        ms_of_period = mission_start_in_ms + ms_in_7_days * math.floor(offset / ms_in_7_days)
        return datetime.datetime.utcfromtimestamp(ms_of_period / 1000)
    elif frame_type == "1month":  # this one is never actually used, included for completeness?
        return datetime.datetime(dt.year, dt.month, 1)
    else:
        return dt


def make_plot(output_path, frame_size, frame_data):
    """
    Create the plot!

    The filename comes from the config_dict, will be saved at path specified by output_path.
    The frame_data dict should have a "time" key which should be the same length for all data.

    :type output_path: str
    :param output_path: string path to save plot to
    :type frame_size: str
    :param frame_size: string frame size specification
    :type frame_data: dict
    :param frame_data: dict containing data to plot
    :return: None
    """

    plt.clf()  # Clear the current figure
    plt.figure(0, figsize=[dscovr_ts_width, dscovr_ts_height])  # new figure

    dscovr_ts_pane_i = 1
    for pane_config in dscovr_ts_pane_config:
        ax = plt.subplot(dscovr_ts_panes, 1, dscovr_ts_pane_i)  # subplot(n rows, n cols, plot n)
        ax2 = None
        # print pane_config[2][0][4]
        # crazy array accessor, gets beginning and end of time dimention
        time = frame_data["time"]
        dscovr_ts_domain = frame_data.get("frame_bounds", [time[0], time[-1]])
        ax.set_xlim(dscovr_ts_domain)
        ax.set_ylabel(pane_config[0])
        ax.grid(True)

        # title at top of figure
        if dscovr_ts_pane_i == 1:
            plt.title("DSCOVR %s summary\n %s through %s" % (
                frame_size,
                dscovr_ts_domain[0],
                dscovr_ts_domain[1]
            ))

        # default to false on storm scale
        use_storm_scale = False
        use_storm_scale_ax2 = False

        # each stroke in the pane
        for stroke in pane_config[2]:
            if len(stroke) == 3:
                # get time and data through the lambda

                lambda_args = [np.asanyarray(frame_data[k]) for k in stroke[2][0]]
                data = stroke[2][1](*lambda_args)

                ax2 = ax.twinx()
                ax2.set_xlim(dscovr_ts_domain)
                ax2.plot(time, data, color=stroke[2][3], label=stroke[2][2])  # plot x, y, format

                # label twinx
                ax2.set_ylabel(stroke[0])

                ax2.yaxis.set_label_position("right")

                sns.despine(ax=ax2, left=True, right=False)

                try:
                    # if max of data is greater than upper bound of quiet scale:
                    if np.nanmax(data) > stroke[1][0][1]:
                        use_storm_scale_ax2 = True
                except ValueError:  # handle no data here, just pass leaving use_storm_scale False
                    pass

                if use_storm_scale_ax2:
                    ax2.set_ylim(stroke[1][1])
                else:
                    ax2.set_ylim(stroke[1][0])

            else:
                # else not a lambda, no calculation required, we can just pull the
                # data out of frame_data
                data = frame_data.get("%s:%s" % (stroke[0], stroke[1]), [])
                # this is either the original specification for what to plot,
                # print "running plt.plot(%s, %s, %s, label=%s)" % (stroke[4], stroke[5], stroke[3], stroke[2])
                if "Temp" in pane_config[0]:
                    try:
                        ax.semilogy(time, data, color=stroke[3], label=stroke[2])
                    except ValueError:
                        pass
                else:
                    ax.plot(time, data, color=stroke[3], label=stroke[2])  # plot x, y, format

                try:
                    # if max of data is greater than upper bound of quiet scale:
                    if np.nanmax(data) > pane_config[1][0][1]:
                        use_storm_scale = True
                except ValueError:  # handle no data here, just pass leaving use_storm_scale False
                    pass

        if use_storm_scale:
            ax.set_ylim(pane_config[1][1])
        else:
            ax.set_ylim(pane_config[1][0])

        # y axis ticks, at most max_yticks ticks found w/ locator
        if "Temp" not in pane_config[0]:
            max_yticks = 6
            yloc = MaxNLocator(max_yticks)
            ax.yaxis.set_major_locator(yloc)

        if ax2 is not None:
            ax2.set_yticks(np.linspace(ax2.get_yticks()[0],
                                       ax2.get_yticks()[-1],
                                       len(ax.get_yticks())))
            ax2.yaxis.set_major_formatter(FormatStrFormatter('%.1f'))

        # x axis labels
        if dscovr_ts_pane_i != dscovr_ts_panes:  # unless it's the last one
            ax.set_xticklabels([])  # gca: get current axes, make so no ticks
            if ax2 is not None:
                ax2.set_xticklabels([])

        if ax2 is not None:
            lines, labels = ax.get_legend_handles_labels()
            lines2, labels2 = ax2.get_legend_handles_labels()
            # put it on ax2 so it comes out on top, otherwise ax2 will draw over
            leg = ax2.legend(lines + lines2, labels + labels2,
                            prop={'size': 10, 'weight': 700}, loc='upper left', frameon=True,
                            framealpha=0.7, ncol=4)
        else:
            leg = ax.legend(prop={'size': 10, 'weight': 700}, loc='upper left', frameon=True,
                            framealpha=0.7, ncol=4)

        # set the linewidth of each legend object, from http://stackoverflow.com/a/9707180
        for legobj in leg.legendHandles:
            legobj.set_linewidth(2.0)

        dscovr_ts_pane_i += 1
        sns.despine(ax=ax, right=True, left=False)

    # after all panes done, put the attribution on the bottom
    ax = plt.subplot(dscovr_ts_panes, 1, dscovr_ts_pane_i - 1)  # subplot(n rows, n cols, plot n)
    plt.text(0, -0.3, dscovr_attribution_text, transform=ax.transAxes, fontsize=10)
    plt.savefig(output_path, bbox_inches='tight')


def main(date_to_plot):

    for frame_size in dscovr_ts_frame_sizes:  # loop over frame sizes defined
        # print( "getting data for: %s" % frame_size[0] )
        frame_beginning = startof_frame(date_to_plot, frame_size[0])  # only used if not 1month frame size
        frame_beginning_millis = unix_time_millis(frame_beginning)

        frame_data = {}

        for pane_config in dscovr_ts_pane_config:
            for stroke in pane_config[2]:  # for multiple strokes on same pane, eg bz, bx, and by
                if len(stroke) == 3:
                    # skip the config line if it's a lambda one
                    continue
                start_millis = frame_beginning_millis + frame_size[3]
                end_millis = frame_beginning_millis + frame_size[4]
                file_paths = []
                if frame_size[0] == "1month":
                    # treated specially because nc.MFDataset can take * wildcard and files are stored
                    # in the directories by month, so format the proper wildcard string for the datatype
                    # Not taking advantage of MFDataset wildcard to simplify implementation, but still,
                    file_paths = find_files_for_month(date_to_plot, stroke[0])
                    end_month = date_to_plot.month + 1
                    end_year = date_to_plot.year
                    if end_month == 13:
                        # exbug: datetime only takes months 1..12, so if end_month is 13, must wrap to
                        # january of next year
                        end_month = 1
                        end_year += 1
                    end_millis = unix_time_millis(datetime.datetime(end_year, end_month, 1))
                else:
                    current_get_millis = frame_beginning_millis
                    while current_get_millis < end_millis:
                        current_get = datetime.datetime.utcfromtimestamp(current_get_millis / 1000)
                        # print( " 		trying date: %s" % current_get )
                        path = find_file(current_get, stroke[0])
                        # print( " 		found: %s"% path )
                        if path:  # because nc.MFDataset can't handle a None
                            file_paths.append(path)
                        current_get_millis += 1000 * 60 * 60 * 24  # increment by millisec in a day

                if dscovr_files_gzipped:
                    file_paths = gunzip_files_to_tmp(file_paths)

                try:
                    dataset = None
                    tries = 0
                    exclude_vars = []  
                    # 100 is pretty but seriously, how many new variables can SWPC add in a month?
                    while dataset is None and tries < 100: 
                        try:
                            tries += 1
                            dataset = nc.MFDataset(file_paths, exclude=exclude_vars)
                        except ValueError:  # handle NETCDF4 files,
                            print "converting to necdf3-classic"
                            file_paths = netcdf4_to_netcdf3_classic(file_paths)
                        except KeyError as e:
                            # if not all the files have the same variables available, MFDataset will
                            # raise a KeyError. Add the offending variable to exclude_vars and try 
                            # again.
                            exclude_vars.append(e.args[0])

                    time = dataset.variables['time'][:]  # type is np.ndarray, pull time from nc file
                    data = np.ma.filled(dataset.variables[stroke[1]][:], np.nan)  # pull out the data

                    # filtering to make sure data in correct range for desired plot and inserting nan so that missing
                    # data arent connected with a line
                    # finaldata = [ x for i,x in enumerate(data) if time[i] > start_millis and time[i] < end_millis ]
                    # finaltime = [ datetime.datetime.utcfromtimestamp( x/1000 ) for x in time if x > start_millis
                    # and x < end_millis ]	# convert to datetimee
                    finaldata = []
                    finaltime = []
                    for i, x in enumerate(data):  # time and data have same dim so this is ok to iterate over both
                        if start_millis <= time[i] <= end_millis:
                            finaldata.append(x)
                            finaltime.append(millis_to_dt(time[i]))

                    # sort the by the time
                    zipped = zip(finaltime, finaldata)
                    zipped.sort(key=lambda tup: tup[0])
                    finaltime, finaldata = zip(*zipped)
                    
                    # make sure the arrays are unique by time
                    finaltime, indices = np.unique(finaltime, return_index=True)
                    finaldata = np.array(finaldata)[indices]

                    prevtime = frame_data.get("time", None)
                    if prevtime is not None:
                        assert all(finaltime == prevtime), "make sure times match, shapes: %s, %s, %s" % (np.shape(finaltime), np.shape(prevtime), stroke)
                    else:
                        frame_data["time"] = finaltime
                    frame_data["%s:%s" % (stroke[0], stroke[1])] = finaldata
                    frame_data["frame_bounds"] = [millis_to_dt(bound) for bound in [start_millis, end_millis-1]]
                except IndexError:
                    # fall through in the case when all the data is missing
                    pass

                if dscovr_files_gzipped:
                    rm_files(file_paths)

        # format path and filename, verify path exists
        plot_path = dscovr_plot_output_base + frame_beginning.strftime(frame_size[1])
        if not os.path.exists(plot_path):
            os.makedirs(plot_path)
        plot_filename = frame_beginning.strftime(frame_size[2])
        out = os.path.join(plot_path, plot_filename)

        # Config now contains the data, so can call make_plot
        print "plotting %s" % out
        make_plot(out, frame_size[0], frame_data)


# get rid of some annoying warnings
if __name__ == "__main__":
    #warnings.filterwarnings("ignore")
    try:
        date = datetime.datetime.strptime(str(sys.argv[1]), "%Y%m%d")
    except (ValueError, IndexError):
        print("Usage: python plotter.py <YYYYmmdd>")
        sys.exit()

    main(date)

    """
    dodate = dscovr_mission_start
    delta = datetime.timedelta(days=1)
    while dodate < date:
        print date.strftime("%Y-%m-%d")
        main(dodate)
        date += delta

    """
