path="test.js"
out=open("test_modified.js",'w')
sheet={
    "a":"10,",
    "d":"20,",
    "f":"30,",
    "_":"-1,",
    "b":"40,",
    "\t":"",
    "\n":""
}
with open(path,newline='') as f:
    out.write('[\n')
    for line in f:
        out.write("[")
        for c in line:
            out.write("{}".format(sheet[c]))
        out.write("],")
out.write(']')
out.close()
