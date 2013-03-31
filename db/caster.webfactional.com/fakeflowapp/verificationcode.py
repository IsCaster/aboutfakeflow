import re
import png
import math

def getPngByte(datauri):
    imgstr = re.search(r'base64,(.*)', datauri).group(1)
    
    return imgstr.decode('base64')
    
def decodeVerificaton(datauri):
    pngByte=getPngByte(datauri)
    (width,height,pixels_rows,meta) = png.Reader(bytes=pngByte).asRGBA8()
    
    # gauss filter image
    new_pixels_rows=[]
    for row in pixels_rows:
        new_pixels_rows.append(row)
    # cut the unnecessary area
    #new_pixels_rows=cutter(new_pixels_rows)    
    new_pixels_rows=filter(new_pixels_rows)
    with open('filter.png' , 'wb') as f:
        w = png.Writer(
            width=width,
            height=height,
            alpha=True,
            bitdepth=8,
            )
        w.write(f,new_pixels_rows)

    #split image
    splitImgs=[[ ],[ ],[ ],[ ],[]]
    for i,row in enumerate(new_pixels_rows):
        if i >= 5 and i <= 16 :
            splitImgs[0].append(row[6*4:6*4+8*4])
            splitImgs[1].append(row[15*4:15*4+8*4])
            splitImgs[2].append(row[24*4:24*4+8*4])
            splitImgs[3].append(row[33*4:33*4+8*4])

    # for i in range(0,4):
        # with open('split%s.png' % i, 'wb') as f:
                    # w = png.Writer(
                        # width=8,
                        # height=12,
                        # alpha=True
                        # )
                    # w.write(f,splitImgs[i])
    #splitImgs[0][]
    anchors=[{"r":0x33,"g":0x33,"b":0xcc},
            {"r":0x66,"g":0x33,"b":0xcc},
            {"r":0x66,"g":0x00,"b":0x99},
            {"r":0x99,"g":0x33,"b":0x66},]
    
    normalizedImgs=[]
    for i in range(0,4):
        output = normalized(splitImgs[i],anchors[i])
        normalizedImgs.append(output)
        # with open('normalized%s.png' % i, 'wb') as f:
            # w = png.Writer(
                # width=8,
                # height=12,
                # greyscale=True,
                # bitdepth=1,
                # )
            # w.write(f,output)
    
    #contrast the standard image to get code    
    contrast_0=[
            [1,1,1,0,0,0,0,1],#line 1
            [1,1,0,0,0,0,0,0],#line 2
            [1,0,0,0,1,1,0,0],#line 3
            [1,0,0,1,1,1,0,0],#line 4
            [0,0,0,1,1,1,0,0],#line 5
            [0,0,1,1,1,1,0,0],#line 6
            [0,0,1,1,1,1,0,0],#line 7
            [0,0,1,1,1,0,0,0],#line 8
            [0,0,1,1,1,0,0,1],#line 9
            [0,0,1,1,0,0,0,1],#line 10
            [0,0,1,0,0,0,1,1],#line 11
            [1,0,0,0,0,1,1,1],#line 12
        ]
    contrast_1=[
            [1,1,1,1,1,0,0,1],#line 1
            [1,1,1,1,0,0,0,1],#line 2
            [1,1,0,0,0,0,0,1],#line 3
            [1,0,0,0,0,0,0,1],#line 4
            [1,0,0,1,0,0,1,1],#line 5
            [1,1,1,1,0,0,1,1],#line 6
            [1,1,1,1,0,0,1,1],#line 7
            [1,1,1,1,0,0,1,1],#line 8
            [1,1,1,1,0,0,1,1],#line 9
            [1,1,1,0,0,0,1,1],#line 10
            [1,1,1,0,0,1,1,1],#line 11
            [1,1,1,0,0,1,1,1],#line 12
        ]
    contrast_2=[
            [1,1,1,0,0,0,0,1],#line 1
            [1,1,0,0,0,0,0,0],#line 2
            [1,0,0,0,1,1,0,0],#line 3
            [1,0,0,1,1,1,0,0],#line 4
            [1,1,1,1,1,1,0,0],#line 5
            [1,1,1,1,1,0,0,0],#line 6
            [1,1,1,1,0,0,0,1],#line 7
            [1,1,1,0,0,0,1,1],#line 8
            [1,1,0,0,0,1,1,1],#line 9
            [1,0,0,0,1,1,1,1],#line 10
            [0,0,0,0,0,0,0,1],#line 11
            [0,0,0,0,0,0,0,1],#line 12
        ]    
    contrast_3=[
            [1,1,1,0,0,0,0,1],#line 1
            [1,1,0,0,0,0,0,0],#line 2
            [1,0,0,1,1,1,0,0],#line 3
            [1,1,1,1,1,1,0,0],#line 4
            [1,1,1,1,1,1,0,0],#line 5
            [1,1,1,1,0,0,0,1],#line 6
            [1,1,1,1,0,0,1,1],#line 7
            [1,1,1,1,1,0,0,1],#line 8
            [1,1,1,1,1,0,0,1],#line 9
            [0,0,1,1,0,0,0,1],#line 10
            [0,0,0,0,0,0,1,1],#line 11
            [1,0,0,0,0,1,1,1],#line 12
        ]    
    contrast_4=[
            [1,1,1,1,1,1,1,0],#line 1
            [1,1,1,1,1,1,0,0],#line 2
            [1,1,1,1,1,0,0,0],#line 3
            [1,1,1,1,0,0,0,1],#line 4
            [1,1,1,0,0,0,0,1],#line 5
            [1,1,0,0,1,0,0,1],#line 6
            [1,0,0,1,1,0,0,1],#line 7
            [0,0,1,1,1,0,0,1],#line 8
            [0,0,0,0,0,0,0,0],#line 9
            [0,0,0,0,0,0,0,0],#line 10
            [1,1,1,1,0,0,1,1],#line 11
            [1,1,1,1,0,0,1,1],#line 12
        ]
    contrast_5=[
            [1,1,1,0,0,0,0,0],#line 1
            [1,1,1,0,0,0,0,0],#line 2
            [1,1,1,0,0,1,1,1],#line 3
            [1,1,0,0,0,1,1,1],#line 4
            [1,1,0,0,0,0,0,1],#line 5
            [1,0,0,0,0,0,0,0],#line 6
            [1,0,0,1,1,1,0,0],#line 7
            [1,1,1,1,1,1,0,0],#line 8
            [1,1,1,1,1,1,0,0],#line 9
            [0,0,1,1,1,0,0,0],#line 10
            [0,0,0,0,0,0,0,1],#line 11
            [1,1,0,0,0,0,1,1],#line 12
        ]        
    contrast_6=[
            [1,1,1,0,0,0,0,1],#line 1
            [1,1,0,0,0,0,0,0],#line 2
            [1,0,0,0,1,1,0,0],#line 3
            [1,0,0,1,1,1,1,1],#line 4
            [0,0,0,0,0,1,1,1],#line 5
            [0,0,0,0,0,0,1,1],#line 6
            [0,0,1,1,0,0,0,1],#line 7
            [0,0,1,1,1,0,0,1],#line 8
            [0,0,1,1,1,0,0,1],#line 9
            [0,0,1,1,0,0,0,1],#line 10
            [1,0,0,0,0,0,1,1],#line 11
            [1,1,0,0,0,1,1,1],#line 12
        ]      
    contrast_7=[
            [0,0,0,0,0,0,0,0],#line 1
            [0,0,0,0,0,0,0,0],#line 2
            [1,1,1,1,0,0,0,0],#line 3
            [1,1,1,1,0,0,0,1],#line 4
            [1,1,1,0,0,0,1,1],#line 5
            [1,1,0,0,0,1,1,1],#line 6
            [1,1,0,0,1,1,1,1],#line 7
            [1,0,0,0,1,1,1,1],#line 8
            [1,0,0,1,1,1,1,1],#line 9
            [0,0,0,1,1,1,1,1],#line 10
            [0,0,1,1,1,1,1,1],#line 11
            [0,0,1,1,1,1,1,1],#line 12
        ]
    contrast_8=[
            [1,1,1,0,0,0,0,1],#line 1
            [1,1,0,0,0,0,0,0],#line 2
            [1,0,0,1,1,1,0,0],#line 3
            [1,0,0,1,1,1,0,0],#line 4
            [1,0,0,1,1,0,0,0],#line 5
            [1,1,0,0,0,0,0,1],#line 6
            [1,0,0,0,0,0,1,1],#line 7
            [0,0,1,1,1,0,0,1],#line 8
            [0,0,1,1,1,0,0,1],#line 9
            [0,0,1,1,0,0,0,1],#line 10
            [0,0,0,0,0,0,1,1],#line 11
            [1,0,0,0,0,1,1,1],#line 12
        ]    
    contrast_9=[
            [1,1,1,0,0,0,0,1],#line 1
            [1,1,0,0,0,0,0,0],#line 2
            [1,0,0,0,1,1,0,0],#line 3
            [1,0,0,1,1,1,0,0],#line 4
            [1,0,0,1,1,1,0,0],#line 5
            [1,0,0,1,1,1,0,0],#line 6
            [1,0,0,0,0,0,0,0],#line 7
            [1,1,0,0,0,0,0,0],#line 8
            [1,1,1,1,1,0,0,1],#line 9
            [0,0,1,1,0,0,0,1],#line 10
            [0,0,0,0,0,0,1,1],#line 11
            [1,0,0,0,0,1,1,1],#line 12
        ]        
    
    contrast_imgs=[contrast_0,contrast_1,contrast_2,contrast_3,contrast_4,contrast_5,
        contrast_6,contrast_7,contrast_8,contrast_9]
    ret_code=""
    for item in normalizedImgs:
        offset_min = 8*12
        code_num = 0
        for number,standard in enumerate(contrast_imgs) :
            offset = contrastImage(item,standard)
            if offset < offset_min :
                offset_min = offset
                code_num = number
            if offset_min == 0 :
                break
        ret_code = ret_code + str(code_num)
    
    return ret_code
    #normalizedImgs    

def contrastImage(source,standard):
    offset = 0
    for j in range(0,len(standard)) :
        for i in range(0,len(standard[0])) :
            if source[j][i] != standard[j][i] :
                offset = offset + 1
    
    return offset    

#anchor
#1st image #3333CC
#2nd image #330099
#3rd image #660099
#4th image #660066

def normalized(imgData,anchor):
    output = []
    for row in imgData :
        output_r =[]
        offset_1=0
        offset_0=0
        for j,pix in enumerate(row) :
            if j%4==0 :
                offset_0=math.fabs(anchor["r"]-pix)
                offset_1=255-anchor["r"]
            elif j%4==3 :
                if offset_0*4 < offset_1 :
                    output_r.append(0)
                else:
                    output_r.append(1)
            elif j%4==1 :
                offset_0=offset_0+math.fabs(anchor["g"]-pix)
                offset_1=offset_1+255-anchor["g"]
            elif j%4==2 :
                offset_0=offset_0+math.fabs(anchor["b"]-pix)
                offset_1=offset_1+255-anchor["b"]
        output.append(output_r)        
    
    return output   
    
def filter(imgData) :
    output = [] 
    for j in range(0,len(imgData)) :
        output_r =[]
        for i in range(0,len(imgData[0])/4) :
            r,g,b,alpha=gaussFilter(imgData,i,j) 
            output_r.append(r)
            output_r.append(g)
            output_r.append(b)
            output_r.append(alpha)
        output.append(output_r)
    return output

def isPointIn(i,j):
    if j>=5 and j<=16 :
        if ( i>=6 and i<=13 ) or ( i>=15 and i<=22 ) or ( i>=24 and i<=31 ) or ( i>=33 and i<=40 ) :
            return True
    return False

def cutter(imgData) :
    output = [] 
    for j in range(0,len(imgData)) :
        output_r =[]
        for i in range(0,len(imgData[0])/4) :
            if isPointIn(i,j):
                r=imgData[0][i*4]
                g=imgData[0][i*4+1]
                b=imgData[0][i*4+2]
                alpha=imgData[0][i*4+3]   
            else:
                r=255
                g=255
                b=255
                alpha=imgData[0][j*4+3]
            output_r.append(r)
            output_r.append(g)
            output_r.append(b)
            output_r.append(alpha)
        output.append(output_r)
    return output

def getPixData(imgData,x,y) :
    if x<0 :
        x = 0
    elif x >= len(imgData[0])/4:
        x = len(imgData[0])/4 -1
    if y<0 :
        y = 0
    elif y >= len(imgData):
        y = len(imgData) -1    
    r=imgData[y][x*4]
    g=imgData[y][x*4+1]
    b=imgData[y][x*4+2]
    alpha=imgData[y][x*4+3]
    return r,g,b,alpha

    # 1/16 1/16 1/16
    # 1/16 1/2  1/16
    # 1/16 1/16 1/16    
def gaussFilter(imgData,x,y) :
    (r,g,b,alpha) = getPixData(imgData,x,y)
    r = r/2.0
    g = g/2.0
    b = b/2.0
    alpha = alpha/2.0
    for i in [-1,0,1]:
        for j in [-1,0,1]:
            if i!=0 or j!=0 :
                (r0,g0,b0,alpha0)=getPixData(imgData,x+i,y+j)
                r=r+r0/16.0
                g=g+g0/16.0
                b=b+b0/16.0
                alpha=alpha+alpha/16.0
    return int(r),int(g),int(b),int(alpha)