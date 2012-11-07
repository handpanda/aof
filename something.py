import zipfile
import xml.dom.minidom

# Xml namespace for open document table tags
OD_TABLE_NS = 'urn:oasis:names:tc:opendocument:xmlns:table:1.0'

def get_text(node):
	text = ''
	for child in node.childNodes:
		if child.nodeType == child.ELEMENT_NODE:
			text = text+get_text(child)
		elif child.nodeType == child.TEXT_NODE:
			text = text+child.nodeValue

	return text

zip_data = zipfile.ZipFile('Untitled 2.ods', 'r')
content = zip_data.read('content.xml')
content = xml.dom.minidom.parseString(content)

# It is important to search using namespace
sheet_list = content.getElementsByTagNameNS(OD_TABLE_NS, 'table')

for sheet in sheet_list:
	sheet_name = sheet.getAttributeNS(OD_TABLE_NS, 'name')
	cells = sheet.getElementsByTagNameNS(OD_TABLE_NS,
		'table-cell')

	for cell in cells:
			print "%s: %s" %(sheet_name, get_text(cell))

zip_data.close()
