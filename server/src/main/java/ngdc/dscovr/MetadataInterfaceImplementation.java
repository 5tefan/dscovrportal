package ngdc.dscovr;

import org.springframework.stereotype.Component;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Document;
import javax.xml.xpath.XPathFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathConstants;

import org.xml.sax.SAXException;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.XPathExpressionException;
import java.io.IOException;


@Component
public class  MetadataInterfaceImplementation implements MetadataInterface {
    private String metadataUrl = "http://www.ngdc.noaa.gov/metadata/published/NOAA/NESDIS/NGDC/STP/Space_Weather/iso/xml/satellite-systems_dscovr.xml";

    @Override
    public String getMetadata() {
        String element = "";
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse( metadataUrl );
            XPathFactory xPathfactory = XPathFactory.newInstance();
            XPath xpath = xPathfactory.newXPath();
            XPathExpression expr = xpath.compile("//*[name()='gmi:MI_Metadata']/*[name()='gmd:fileIdentifier']/*[name()='gco:CharacterString']");
            element = (String) expr.evaluate(doc, XPathConstants.STRING);
        } catch (IOException | ParserConfigurationException | SAXException | XPathExpressionException ex) {
            System.out.println( ex.getMessage() );
        }
        return element;
    }

}

