package dscovr;

import java.util.List;
import java.util.ArrayList;

import java.io.File;

import org.joda.time.DateTimeZone;
import org.joda.time.LocalDate;
import org.joda.time.Interval;

import java.util.concurrent.atomic.AtomicLong;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
public class DscovrFileListController {

	private static final String dirBase = "/nfs/dscovr_public/";
	private static final String dirStruct = "Y/MM";
	//TODO put actual mission start in here
	public static final LocalDate MissionStart = new LocalDate(2000, 06, 10);
	//uncommend this, add the date when the mission ends, also see below in the 
	//validateTimeBound function
	//public static final LocalDate MissionEnd = new LocalDate(year, month, day);

	@RequestMapping(value={"/between/{start}/{end}"}, method=RequestMethod.GET, headers="accept=application/json")
	public @ResponseBody List<String> getFiles(@PathVariable("start") String start, @PathVariable("end") String end) {
		List<String> fileList = new ArrayList<String>();
		Interval requestInterval = new Interval( validateTimeBound(start).toDate().getTime(),
			validateTimeBound(end).toDate().getTime() );
		for (long timestep = requestInterval.getStartMillis(); 
			timestep < requestInterval.getEndMillis(); 
			timestep += 1000 * 60 * 60 * 24)
		{
			LocalDate iterDate = new LocalDate( timestep );
			String dateDir = dirBase + iterDate.toString( dirStruct );
			//fileList.add( dateDir );
			File iterFolder = new File( dateDir );
			for ( final File fileEntry : iterFolder.listFiles() ) {
				if ( ! fileEntry.isDirectory() ) {
					fileList.add( fileEntry.getName() );
				}
			}
		}

		return fileList;
	}

	protected LocalDate validateTimeBound(String sec) {
		LocalDate MissionEnd = new LocalDate( System.currentTimeMillis() );
		long seconds;
		try {
			seconds = Long.parseLong( sec );
		} catch (NumberFormatException e) {
			throw new IllegalArgumentException( "Seconds not parsable" );
		}
		LocalDate request = new LocalDate( seconds * 1000 );
		if ( request.toDate().getTime() > MissionEnd.toDate().getTime() 
			|| request.toDate().getTime() < MissionStart.toDate().getTime() ) 
		{
			 throw new IllegalArgumentException("requested time is out of bounds");
		}
	
		return request;
	}
		
		
}
