import os
import sys
import json
import re

path_to_plotter="plotter.py"

if __name__ == "__main__":
	# get set up reading the file recipt 
	assert len(sys.argv) >= 2
	recipt = sys.argv[1]
	assert os.path.isfile(recipt)
	with open(recipt, 'r') as open_recipt:
		file_list = json.loads(open_recipt.read())

	# go through the file recipts and pull out the unqiue dates
	unqiue_dates = []
	for file_name in file_list["fullpath_file_names_moved"]:
	match = re.search('s([0-9]+)', file_name)
		if match:
			unique_dates.append(match.group(1))

	# make all dates unique
	unique_dates = list(set(unique_dates))

	for date in unique_dates:
		os.system("python %s %s"%(path_to_plotter, date))

