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
import org.springframework.beans.factory.annotation.Autowired;

@RestController
public class MetadataController {

    @Autowired
    private MetadataInterface mi;;

    //TODO: change /testing to /views/main.html to override the static main view with
    //a view contianing the injected metadata, might not even need a templating app to
    //do this.
    //
    //Also looking at changing the MetadataInterface getMetadata call to take the xpath 
    //paths to the elements it wants as an array, this would prevent hardcoding the 
    //elements in getMetadata and allow it to be used elsewhere if needed
    @RequestMapping(value={"/testing"}, method=RequestMethod.GET)
    public @ResponseBody String gettaMettadatarhu() {
        String testElement = mi.getMetadata();
        return testElement;
    }
		
}
