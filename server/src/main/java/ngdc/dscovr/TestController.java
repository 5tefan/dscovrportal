package ngdc.dscovr;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
public class TestController {

	@RequestMapping(value={"/views/main.html"}, method=RequestMethod.GET)
	public @ResponseBody String getFiles() {
            return "hey";
	}
}
