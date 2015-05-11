package dscovr;

import static org.junit.Assert.*;
import org.junit.Before;
import org.junit.Test;

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
    public void shouldParseDatesFromFileName() {
        String testFileName = "it_att_dscovr_s20150315000000_e20150315235959_p20150317012246_emb.nc";
        DateTime start = new DateTime(2015, 03, 15, 0, 0, 0);
        DateTime end = new DateTime( 2015, 03, 15, 23, 59, 59);
        DateTime[] range = controller.getFileDateTimeRange( testFileName );
        assertEquals("Start datetime not parsed correctly", start.toString(), range[0].toString());
        assertEquals("End datetime not parsed correctly", end.toString(), range[1].toString());
    }

}

        
