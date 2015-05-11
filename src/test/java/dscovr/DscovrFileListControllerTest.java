package dscovr;

import static org.junit.Assert.*;
import org.junit.Before;
import org.junit.Test;

import org.joda.time.LocalDate;
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
            LocalDate DayBeforeMissionStart = controller.MissionStart.minusDays(1);
            String input = String.valueOf( DayBeforeMissionStart.toDateTimeAtCurrentTime().getMillis()/1000 ); 
            controller.validateTimeBound( input );
            fail("should have thrown IllegalArgumentException");
        } catch (IllegalArgumentException e) {}

    }

    @Test
    public void shouldAcceptValidTime() {
        try {

            //test the day the mission started
            LocalDate DayBeforeMissionStart = controller.MissionStart;
            String input = String.valueOf( DayBeforeMissionStart.toDateTimeAtCurrentTime().getMillis()/1000 ); 
            controller.validateTimeBound( input );

        } catch (IllegalArgumentException e) {
            fail("should not have thrown IllegalArgumentException");
        }
    }

}

        
