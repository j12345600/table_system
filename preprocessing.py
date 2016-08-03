path="test.js"
out=open("test_modified.js",'w')
with open(path,newline='') as f:
    out.write('[\n')
    for line in f:
        out.write("\'"+line.replace("	","").replace('\n','')+"\',")
out.write(']')
out.close()
