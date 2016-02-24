# validate user input
import sys

def validateArgvInt(argv):
    
    def is_intstring(s):
        try:
            int(s)
            return True
        except ValueError:
            return False

    for arg in argv:
        if not is_intstring(arg):
            sys.exit("All arguments must be integers. Exit.")
