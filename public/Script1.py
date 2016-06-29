import random
f=open('page.html','w')
r=10
c=10
condition=[":)",":|",":("]
f.write("<!DOCTYPE html>\n")
f.write("<html>\n")
f.write("<head>\n")
f.write("<style>\n")
f.write("table, th, td {\n")
f.write("border: 1px solid black;\n")
f.write("}\n")
f.write("td {\n")
f.write("background-color: green;\n")
f.write("color: white;\n")
f.write("padding: 10px 20px;\n")
f.write("text-decoration: none;\n")
f.write("border-radius: 4px 4px 0 0;\n")
f.write("}\n")
f.write("td:hover {\n")
f.write("background-color: blue;\n")
f.write("}\n")
f.write("</style>\n")
f.write("</head>\n")
f.write("<body>\n")
f.write("<table style=\"width:100%\">\n")
for i in range(0,r):
    f.write("<tr>\n")
    for j in range(0,c):
        f.write("<td>{}</td>\n".format(condition[random.randint(0,2)]))
    f.write("</tr>\n")
f.write("</table>\n</body>\n</html>")