package ngdc.dscovr;

import java.text.ParseException;

import java.io.File;

import java.util.List;
import java.util.ArrayList;

import org.joda.time.DateTimeZone;
import org.joda.time.DateTime;
import org.joda.time.Interval;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
public class DataFileListingController {

	//these constants are all dependent on the setup of the filesystem, make sure they match
	private static final String dirBase = "/nfs/dscovr_private/";
	private static final String dirStruct = "Y/MM";
        private static final String datePattern = "yyyyMMddHHmmss";
        private static final DateTimeFormatter sFormat = DateTimeFormat.forPattern( "'s'" + datePattern );
        private static final DateTimeFormatter eFormat = DateTimeFormat.forPattern( "'e'" + datePattern );

	//TODO put actual mission start in here, format (year, month, day, hour, minute)
	public static final DateTime MissionStart = new DateTime(2000, 06, 10, 0, 0);
	//uncommend this, add the date when the mission ends, also see below in the 
	//validateTimeBound function
	//public static final DateTime MissionEnd = new DateTime(year, month, day, hour, minute, second);

	@RequestMapping(value={"/between/{start}/{end}"}, method=RequestMethod.GET, headers="accept=application/json")
	public @ResponseBody List<String> getFiles(@PathVariable("start") String start, @PathVariable("end") String end) {

		List<String> fileList = new ArrayList<String>();
                DateTime validStart = validateTimeBound( start );
                DateTime validEnd = validateTimeBound( end );
                Interval requestInterval = new Interval( validStart, validEnd );

		//iterate by months since that is the directory resolution
                for ( DateTime iter = validStart; iter.isBefore( validEnd ); iter = iter.plusMonths(1) ) {

                    String dirToSearch = dirBase + iter.toString( dirStruct );
                    File folder = new File( dirToSearch );
                    for ( final File fileEntry : folder.listFiles() ) {

                        if ( ! fileEntry.isDirectory() ) {
                            String fileName = fileEntry.getName();
                            try {
                                DateTime[] range = getFileDateTimeRange( fileName );
                                Interval fileInterval = new Interval( range[0], range[1] );
                                if (requestInterval.contains( fileInterval ) ) {
                                    fileList.add( fileName );
                                    //fileList.add ( range[0].toString(datePattern) ); //TESTING
                                }
                            } catch (ParseException | IllegalArgumentException ex) {
                                // ignore the file if the filename doesn't look how we expect it to
                                // will assume it is not supposed to be there.
                            };
                        }

                    } //end for:fileEntry

                } //end for:iter


		return fileList;
	}

	protected DateTime validateTimeBound(String msString) {
                //Until the mission actually ends, the end time is latest time we have data.
                //approximate latest time with data as now for every request
                DateTime MissionEnd = new DateTime();

		//parse string
                long msLong;
		try {
			msLong = Long.parseLong( msString );
		} catch (NumberFormatException e) {
			throw new IllegalArgumentException( "Seconds not parsable" );
		}

		//then validate time is in bounds
                DateTime request = new DateTime( msLong );
                if ( request.isBefore( MissionStart ) || request.isAfter( MissionEnd ) ) {
			 throw new IllegalArgumentException("requested time is out of bounds");
		}
	
		return request;
	}

        protected DateTime[] getFileDateTimeRange(String fileName) throws ParseException {
            //example file name:
            //it_att_dscovr_s20150315000000_e20150315235959_p20150317012246_emb.nc
            String[] fileNameParts = fileName.split("_");
            //some sanity checks on the format of the filename
            if (fileNameParts.length < 5 || fileNameParts[3].length() != 15 || fileNameParts[4].length() != 15 ) {
                throw new ParseException("filename malformed", 0);
            }
            
            //parse the start datetime
            String sDateString = fileNameParts[3];
            DateTime start = sFormat.parseDateTime( sDateString );

            //parse the end datetime
            String eDateString = fileNameParts[4];
            DateTime end  = eFormat.parseDateTime( eDateString );

            DateTime[] range = {start, end};
            return range;
            
        }
		
		
}
