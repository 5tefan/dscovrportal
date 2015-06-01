#!/usr/bin/env python

""" Imports """
# Python provided libraries
import datetime
import logging
import numpy as np
import os
import sys
import time
import fnmatch
import traceback
import netCDF4 as nc


############## config ####################
dscovr_mission_start = datetime.datetime(2015, 06, 15)
dscovr_file_base = '/nfs/dscovr_private/'
dscovr_plot_output_base = '/nfs/dscovr_private/plots'

dscovr_ts_width = 14 	#inches
dscovr_ts_height = 10 	#inches


dscovr_ts_pane_config = [
	# Y axis label		#[quiet scale, storm scale]	#line config [ ["file", "datatype", "label", "style"], ["file", "datatype", "label", "style"] ]
								# file is the file in which datatype is found
								# datatype corresponds to what is in the netcdf file
								# leave label empty "" for no legend
	["Pressure\n [nPa]",	[ [0,5], [0,10] ], 		[["m1m", "bz_gsm", "", "b-"]] ],
	["Mag\n [nT]",		[ [-20, 20], [-50,50] ], 	[["m1m", "bx_gsm", "Bx(gsm)", "r-"], ["m1m", "by_gsm", "By(gsm)", "g-"], ["m1m", "bz_gsm", "Bz(gsm)", "k-"]] ],
	["Mag\n [nT]",		[ [-20, 20], [-50,50] ], 	[["m1m", "bx_gsm", "Bx(gsm)", "r-"], ["m1m", "by_gsm", "By(gsm)", "g-"], ["m1m", "bz_gsm", "Bz(gsm)", "k-"]] ],
	["Speed\n [km/s]",	[ [200, 800], [200, 800] ], 	[["f1m", "alpha_speed", "Vsw DSCOVR", "b-"], ["f1m", "alpha_speed", "Vsw Bow", "k-"]] ],
	["Prop Time\n [min]",	[ [20, 100], [20, 100] ], 	[["f1m", "alpha_speed", "", "k-"]] ],
	["Temperature\n [K]",	[ [10e4, 10e6], [10e4, 10e6] ],	[["f1m", "alpha_temperature", "Temp DSCOVR", "k-"]] ],
	["Density\n [cc]",	[ [0, 90], [0,90] ], 		[["f1m", "alpha_density", "Dens DSCOVR", "b-"], ["f1m", "alpha_density", "Dens Bow", "k-"]] ]
]

dscovr_ts_panes = len( dscovr_ts_pane_config )	#number of panes
##########################################


def find_file(dt, type):
	"""Since the processing time is unknown, use the type and the date to
	make a string like it_m1m_dscovr_s(date)_e(date)_p*_pub.nc and pattern match
	to fill in the processing date p*"""
	seek_path_piece = dscovr_file_base + dt.strftime("%Y/%m/")					##path under file base to look in
	seek_path_full = os.path.join( dscovr_file_base, seek_path_piece )
	seek_filename = dt.strftime("it_%%s_dscovr_s%Y%m%d000000_e%Y%m%d235959_p*_emb.nc") % type	##file name with * instead of processing date
	for root, dirs, files in os.walk( seek_path_full ):
		for name in files:
			if fnmatch.fnmatch( name, seek_filename ):
				return os.path.join( root, name )

def get_output_dir(dt, plot_type):
	seek_path = dscovr_plot_output_base + "/dscovr_1day_plots/" + dt.strftime("%Y/%m")
	if not os.path.exists( seek_path ):
		os.makedirs( seek_path )
	return seek_path

def make_output_filename(dt, plot_type):
	return "test"
	

def unix_time_millis(dt):
	epoch = datetime.datetime.utcfromtimestamp(0)
	delta = dt - epoch
	return delta.total_seconds() * 1000.

def startof_3day(dt):
	ms_in_3_days = 1000 * 60 * 60 * 24 * 3
	mission_start_in_ms = unix_time_millis( dscovr_mission_start )
	dt_in_ms = unix_time_millis( dt )
	offset = dt_in_ms - mission_start_in_ms
	ms_of_period = mission_start_in_ms + ms_in_3_days * (offset % ms_in_3_days)
	return datetime.fromtimestamp( ms_of_period )


def startof_7day(dt):
	ms_in_7_days = 1000 * 60 * 60 * 24 * 7
	mission_start_in_ms = unix_time_millis( dscovr_mission_start )
	dt_in_ms = unix_time_millis( dt )
	offset = dt_in_ms - mission_start_in_ms
	ms_of_period = mission_start_in_ms + ms_in_7_days * (offset % ms_in_7_days)
	return datetime.fromtimestamp( ms_of_period )

def startof_1month(dt):
	return datetime.datetime( dt.year, dt.month, 1 )

def make_plot(output_path): ##can only be called after dscovr_ts_pane_config has been filled out with data

	import matplotlib as mpl
	mpl.use( 'Agg' )				##necessary when there is no xserver avail
	import matplotlib.pyplot as plt

	plt.figure( 0, figsize = [dscovr_ts_width, dscovr_ts_height] ) 		#new figure
	plt.clf()								#Clear the current figure

	dscovr_ts_pane_i = 1
	for pane_config in dscovr_ts_pane_config:
		plt.subplot( dscovr_ts_panes, 1, dscovr_ts_pane_i) 		#subplot(n rows, n cols, plot n)
		#print pane_config[2][0][4]
		dscovr_ts_domain = [ pane_config[2][0][4][:][0], pane_config[2][0][4][:][-1] ]
		plt.xlim( dscovr_ts_domain )
		
		#title at top of figure
		if dscovr_ts_pane_i == 1: 
			plt.title( "DSCOVR test plot" )
	
		##each line in the plot
		for line in pane_config[2]:
			#print "running plt.plot(%s, %s, %s, label=%s)" % (line[4], line[5], line[3], line[2])
			plt.plot( line[4], line[5], line[3], label=line[2])			#plot x, y, format

		##x axis labels
		if dscovr_ts_pane_i != dscovr_ts_panes:			#if its not the last one
			plt.gca().set_xticklabels( [] )			#gca: get current axes, make so no ticks
		else:
			pass
			#ax = plt.gca()
			#ax.xaxis.set_major_locator( mpl.dates.HourLocator() )
			#ax.xaxis.set_major_formatter( mpl.dates.DateFormatter( '%H' ) )
			#ax.set_ylim( bottom=0 )
			
		plt.legend( prop={'size':7}, loc='upper left' )
		plt.ylabel( pane_config[0] )
		plt.ylim( pane_config[1][0] )
		plt.grid( True )
		dscovr_ts_pane_i += 1

	"""
	#plot pressure 
	plt.subplot( dscovr_ts_panes, 1, dscovr_ts_pane_i) 		#subplot(n rows, n cols, plot n)
	plt.plot( dscovr_ts_time, dscovr_ts_bz, 'k+')			#plot x, y, format
	plt.title( "DSCOVR test plot" )
	plt.xlim( dscovr_ts_domain )
	plt.gca().set_xticklabels( [] )					#gca: get current axes, make so no ticks
	plt.ylabel( 'Pressure\n' '[nPa]' )
	plt.ylim( [-15, 15] )
	plt.grid( True )
	"""

	plt.savefig( output_path, bbox_inches='tight' )

def main():
	
	for pane_config in dscovr_ts_pane_config:
		for line in pane_config[2]:
			path = find_file( datetime.datetime(2015,03,19), line[0])
			dataset = nc.Dataset( path )
			time = dataset.variables[ 'time' ][:]
			line.append( time.astype( datetime.datetime ) )
			data = dataset.variables[ line[1] ][:]
			line.append(data)
			print( type( time.astype( datetime.datetime )[0] ) )
	
	outdir = get_output_dir( datetime.datetime(2015, 03, 19), "1d" )
	outfile = make_output_filename( datetime.datetime(2015, 03, 19), "1d" )

	out = os.path.join( outdir, outfile )


	make_plot( out )

main()

## next steps, get more data flowing
## creating and populating the directory structure


"""
plt.figure( 0, figsize=[14,10] )
plt.clf()
tick_format = mpl.dates.DateFormatter( '%H' )
xlim = [ self.dt[0], self.dt[-1] ]
n_plots = 8
i_plot = 0


# Shue at noon (r0)
plt.subplot( n_plots, 1, i_plot )
plt.plot( self.output['dt'], self.output['shue']['r0'], 'k+' )
plt.title( '%s to %s' % ( self.output['dt'][0], self.output['dt'][-1] ) )
plt.xlim( xlim ), plt.gca().set_xticklabels( [] )
plt.ylabel( 'Shue r0\n' '[Re]' ), plt.ylim( [5, 15] )
plt.grid( True )

# Mag field
i_plot += 1
plt.subplot( n_plots, 1, i_plot )
for g_num in [13,14,15]:
t_name_num = 'goes-%02d' % ( g_num )
t_goes_mag = self.goes[t_name_num]['mag']
if   13 == g_num: t_color = 'k'
elif 14 == g_num: t_color = 'b'
elif 15 == g_num: t_color = 'g'
#plt.plot( t_goes_mag.dt, t_goes_mag['mag_out']['epn']['Ht'], 'k'+t_lstyle, label='G'+str(g_num)+': Ht' )
#plt.plot( t_goes_mag.dt, t_goes_mag['mag_out']['epn']['He'], 'b'+t_lstyle, label='G'+str(g_num)+': He' )
plt.plot( t_goes_mag.dt, t_goes_mag['mag_out']['epn']['Hp'], color=t_color, label='G'+str(g_num)+': Hp' )
#plt.plot( t_goes_mag.dt, t_goes_mag['mag_out']['epn']['Hn'], 'g'+t_lstyle, label='G'+str(g_num)+': Hn' )
plt.xlim( xlim ), plt.gca().set_xticklabels( [] )
plt.ylabel( 'nT' ), plt.ylim( [-250, 250] )
plt.legend( prop={'size':7}, loc='upper left' )
plt.grid( True )

# MLT
i_plot += 1
plt.subplot( n_plots, 1, i_plot )
for g_num in [13,14,15]:
t_name_num = 'goes-%02d' % ( g_num )
t_goes_loc = self.goes[t_name_num].mag['orbit']
if   13 == g_num: t_lstyle = 'k'
elif 14 == g_num: t_lstyle = 'b'
elif 15 == g_num: t_lstyle = 'g'
plt.plot( t_goes_loc['dt'], t_goes_loc['mlt'], t_lstyle, label='G'+str(g_num) )
plt.xlim( xlim ), plt.gca().set_xticklabels( [] )
plt.ylabel( 'MLT' ), plt.ylim( [0, 24] )
plt.grid( True )

# SW Bowshock: Mag field
i_plot += 1
plt.subplot( n_plots, 1, i_plot )
plt.plot( self.ace['mag'].dt, self.ace['mag']['gsm']['z'], color='gray', label='Bz(gsm) ACE' )
plt.plot( self.bowshock.dt, self.bowshock['mag']['gsm']['x'], 'k', label='Bx(gsm) Bow' )
plt.plot( self.bowshock.dt, self.bowshock['mag']['gsm']['y'], 'g', label='By(gsm)' )
plt.plot( self.bowshock.dt, self.bowshock['mag']['gsm']['z'], 'r', label='Bz(gsm)' )
plt.xlim( xlim ), plt.gca().set_xticklabels( [] )
plt.ylabel( 'nT' ), plt.ylim( [-20, 20] )
plt.legend( prop={'size':7}, loc='upper left' )
plt.grid( True )

# SW Bowshock and ACE: Speed
i_plot += 1
plt.subplot( n_plots, 1, i_plot )
plt.plot( self.ace['swepam'].dt, self.ace['swepam']['proton_speed'], 'k', label='Vsw ACE' )
plt.plot( self.bowshock.dt, self.bowshock['speed'], 'b', label='Vsw Bow' )
plt.xlim( xlim ), plt.gca().set_xticklabels( [] )
plt.ylabel( 'Speed\n' '[km/s]' ), plt.ylim( [200, 800] )
plt.legend( prop={'size':7}, loc='upper left' )
plt.grid( True )

# SW Bowshock: Propagation Time
i_plot += 1
plt.subplot( n_plots, 1, i_plot )
plt.plot( self.output['dt'], self.output['bowshock']['lag_minutes'], 'k' )
plt.xlim( xlim ), plt.gca().set_xticklabels( [] )
plt.ylabel( 'Prop Time\n' '[min]' ), plt.ylim( [20, 100] )
plt.grid( True )

# SW Bowshock: Pressure [nPa]
i_plot += 1
plt.subplot( n_plots, 1, i_plot )
plt.plot( self.ace['swepam']['dt'], self.ace['swepam']['pressure_dynamic'], 'k', label='Pn ACE' )
plt.plot( self.bowshock.dt,         self.bowshock['pressure_dynamic'],      'b', label='Dp Bow' )
plt.xlim( xlim ), plt.gca().set_xticklabels( [] )
plt.ylabel( 'Pressure\n' '[nPa]' ), plt.ylim( [0, 30] )
plt.grid( True )

# SW Bowshock: Density
i_plot += 1
plt.subplot( n_plots, 1, i_plot )
plt.plot( self.ace['swepam']['dt'], self.ace['swepam']['proton_density'], 'k', label='Dens ACE' )
plt.plot( self.bowshock.dt,         self.bowshock['density'],               'b', label='Dens Bow' )
plt.xlabel( 'UTC' ), plt.xlim( xlim )
plt.ylabel( '[cc]' ), plt.ylim( [0, 30] )
plt.legend( prop={'size':7}, loc='upper left' )
plt.grid( True )


# X-axis Time of Day
ax = plt.gca()
ax.xaxis.set_major_locator( mpl.dates.HourLocator() ), ax.xaxis.set_major_formatter( tick_format ), ax.set_ylim( bottom=0 )
#plt.xticks(rotation='vertical')


# Save
#plt.show()
t_dir_out = self.config['dir_out'] + \
	    '/data/%4d/%02d/%02d/' % ( self.dt[-1].year, self.dt[-1].month, self.dt[-1].day )

fn_plot = '%s/%s_%d-%02d-%02d_timeseries.png' % \
( t_dir_out, self.fn_out_prefix, self.dt[-1].year, self.dt[-1].month, self.dt[-1].day )

# save to temporary, then rename
plt.savefig( fn_plot+'_tmp.png', bbox_inches='tight' )
os.rename( fn_plot+'_tmp.png', fn_plot )
logger.info( my_name + ': Plotted Time Series to: ' + fn_plot )

# Link
if self.config['do_link']:
	fn_link = self.config['dir_out'] + '/data/' + self.fn_out_prefix + '_timeseries_realtime.png'
if os.path.isfile( fn_link ): os.unlink( fn_link )
	os.symlink( fn_plot, fn_link )

if __name__ == "__main__":
	import getopt
	usage = "DSCOVRplot.py [-d <date> [-n <days>]]"
	try:
		opts, args = getopt.getopt( argv, "hdn")
	except getopt.GetoptError:
		print usage
	for opt, arg in opts:
		if opt == '-h':
			print usage
			sys.exit()
		elif opt in ('-d'):
			pass #strptime parse
		elif opt in ('-n'):
			pass #number of days
class DSCOVR_web_canned_plot:

	def __init__(self, date=None ):
		self.dscovr_mission_start = datetime.datetime(2015, 06, 15)
		self.dscovr_file_base = '/nfs/dscovr_private/'
		if date == None:
			self.date = datetime.datetime.now()
		else:
			self.date = date
		
	def plot_6hr(self, date):
		pass

	def plot_1day(self, date):
		pass

	def plot_3day(self, date):
		pass

	def plot_7day(self, date):
		pass

	def plot_1month(self, date):
		pass

	def startof_3day(self, date):
		pass

	def startof_7day(self, date):
		pass

	def startof_1month(self, date):
		pass

	def make_plot(self, time, data):
		pass

	def find_file(self, date, type):
		#Since the processing time is unknown, make a fuzzy search for it
		seek_path_piece = self.dscovr_file_base + date.strftime("%Y/%m/")					##path under file base to look in
		seek_path_full = os.path.join( self.dscovr_file_base, seek_path_piece )
		seek_filename = date.strftime("it_%%s_dscovr_s%Y%m%d000000_e%Y%m%d235959_p*_emb.nc") % type	##file name with * instead of processing date
		for root, dirs, files in os.walk( seek_path_full ):
			for name in files:
				if fnmatch.fnmatch( name, seek_filename ):
					return os.path.join( root, name )
"""
