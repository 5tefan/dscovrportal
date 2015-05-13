package ngdc.dscovr;

import static org.junit.Assert.*;
import org.junit.Before;
import org.junit.Test;

import java.text.ParseException;

import org.joda.time.DateTime;

public class DscovrFileListControllerTest {
    private DscovrFileListController controller;

    @Before
    public void setup() {
        controller = new DscovrFileListController();
    }

    @Test
    public void shouldRejectInvalidTime() {
        try {
            controller.validateTimeBound("asdf");
            fail("should have thrown IllegalArgumentException");
        } catch (IllegalArgumentException e) {}

        try {
            controller.validateTimeBound("asdfasdf");
            fail("should have thrown IllegalArgumentException");
        } catch (IllegalArgumentException e) {}

        try {
            controller.validateTimeBound("asdfasdfasdf");
            fail("should have thrown IllegalArgumentException");
        } catch (IllegalArgumentException e) {}

        try {
        
            //test the day before the mission start
            DateTime DayBeforeMissionStart = controller.MissionStart.minusDays(1);
            String input = String.valueOf( DayBeforeMissionStart.getMillis() );
            controller.validateTimeBound( input );
            fail("should have thrown IllegalArgumentException");
        } catch (IllegalArgumentException e) {}

    }

    @Test
    public void shouldAcceptValidTime() {
        try {

            //test the day the mission started
            DateTime DayOfMissionStart = controller.MissionStart;
            String input = String.valueOf( DayOfMissionStart.getMillis() );
            controller.validateTimeBound( input );

        } catch (IllegalArgumentException e) {
            fail("should not have thrown IllegalArgumentException");
        }
    }

    @Test
    public void shouldParseDatesFromValidFileName() {
        try {
            String testFileName = "it_att_dscovr_s20150315000000_e20150315235959_p20150317012246_emb.nc";
            DateTime start = new DateTime(2015, 03, 15, 0, 0, 0);
            DateTime end = new DateTime( 2015, 03, 15, 23, 59, 59);
            DateTime[] range = controller.getFileDateTimeRange( testFileName );
            assertEquals("Start datetime not parsed correctly", start.toString(), range[0].toString());
            assertEquals("End datetime not parsed correctly", end.toString(), range[1].toString());
        } catch (ParseException ex) {
            fail("should not have thrown ParseException");
        }
    }

    @Test
    public void shouldRejectInvalidFileName() {
        try {
            //date strings wrong length
            String testFileName = "it_att_dscovr_s201503214132354000000_e2234023423423415031454322333235959_p201150317a012246_emb.nc";
            DateTime[] range = controller.getFileDateTimeRange( testFileName );
            fail("should have thrown ParseException");
        } catch (ParseException ex) {}
        try {
            //expects start before end
            String testFileName = "it_att_dscovr_e20150315000000_s20150315235959_p20150317012246_emb.nc";
            DateTime[] range = controller.getFileDateTimeRange( testFileName );
            fail("should have thrown IllegalArgumentException");
        } catch (ParseException | IllegalArgumentException ex) {}
    }

}

        
