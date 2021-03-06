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
    new_pixels_rows=cutter(new_pixels_rows,isPointIn)    
    new_pixels_rows=filter(new_pixels_rows)
    # with open('filter.png' , 'wb') as f:
        # w = png.Writer(
            # width=width,
            # height=height,
            # alpha=True,
            # bitdepth=8,
            # )
        # w.write(f,new_pixels_rows)

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
    
    
#anchor
#1st image #3300CC
#2nd image #330099
#3rd image #660066
#4th image #660033

    anchors=[{"r":0x33,"g":0x33,"b":0xcc},
            {"r":0x66,"g":0x33,"b":0xcc},
            {"r":0x66,"g":0x00,"b":0x99},
            {"r":0x99,"g":0x33,"b":0x66},]

    
    normalizedImgs=[]
    for i in range(0,4):
        output = normalized(splitImgs[i],anchors[i])
        output=sharpen(output)
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
        code_num_near = 0
        for number,standard in enumerate(contrast_imgs) :
            offset = contrastImage(item,standard)
            if offset < offset_min :
                code_num_near = code_num
                offset_min = offset
                code_num = number
            if offset_min == 0 :
                break
            # adjust 5 and 6        
            #if (code_num==5 and code_num_near == 6 ) or (code_num==6 and code_num_near == 5):
            if code_num==5 or code_num==6:
                lp_7=7
                lp_8=7
                for i in range(0,8):
                    if item[7][i]==0:
                        lp_7=i
                        break
                for i in range(0,8):
                    if item[8][i]==0:
                        lp_8=i
                        break
                if lp_7+lp_8>9:
                    code_num=5
                else:
                    code_num=6
            
            # if (code_num==7 and code_num_near == 1 ) or (code_num==1 and code_num_near == 7):
                # if tp(0) == 12 or tp(7) == 12:
                    # code_num==1
                # else:
                    # code_num==7
                        
        ret_code = ret_code + str(code_num)
            
                    
    return ret_code

def decodeNewVerificaton(datauri):
    pngByte=getPngByte(datauri)
    (width,height,pixels_rows,meta) = png.Reader(bytes=pngByte).asRGBA8()
    
    # gauss filter image
    new_pixels_rows=[]
    for row in pixels_rows:
        new_pixels_rows.append(row)
    # cut the unnecessary area
    new_pixels_rows=uncrook(new_pixels_rows)    
    new_pixels_rows=cutter(new_pixels_rows,newIsPointIn)    
    #new_pixels_rows=filter(new_pixels_rows)
    # with open('filter.png' , 'wb') as f:
        # w = png.Writer(
            # width=width,
            # height=height,
            # alpha=True,
            # bitdepth=8,
            # )
        # w.write(f,new_pixels_rows)

    #split image
    splitImgs=[[ ],[ ],[ ],[ ],[]]
    for i,row in enumerate(new_pixels_rows):
        if i >= 7 and i <= 26 :
            splitImgs[0].append(row[10*4:10*4+14*4])
            splitImgs[1].append(row[25*4:25*4+14*4])
            splitImgs[2].append(row[40*4:40*4+14*4])
            splitImgs[3].append(row[55*4:55*4+14*4])

    # for i in range(0,4):
        # with open('split%s.png' % i, 'wb') as f:
            # w = png.Writer(
                # width=14,
                # height=20,
                # alpha=True
                # )
            # w.write(f,splitImgs[i])
    #splitImgs[0][]
    
    
#anchor
#1st image #3300CC
#2nd image #330099
#3rd image #660066
#4th image #660033

    anchors=[{"r":0,"g":43,"b":255},
            {"r":51,"g":85,"b":255},
            {"r":102,"g":128,"b":255},
            {"r":102,"g":170,"b":255},]

    
    normalizedImgs=[]
    for i in range(0,4):
        output = normalized(splitImgs[i],anchors[i])
        output=sharpen(output)
        normalizedImgs.append(output)
        # with open('normalized%s.png' % i, 'wb') as f:
            # w = png.Writer(
                # width=14,
                # height=20,
                # greyscale=True,
                # bitdepth=1,
                # )
            # w.write(f,output)
    
    #contrast the standard image to get code    
    contrast_0=[
            [1,1,1,0,0,0,0,1,1,1,1,1,1,1],#line 1
            [1,1,0,0,0,0,0,0,0,1,1,1,1,1],#line 2
            [1,1,0,0,0,0,0,0,0,0,0,1,1,1],#line 3
            [1,1,0,0,0,1,1,1,0,0,0,1,1,1],#line 4
            [1,1,0,0,0,1,1,1,1,1,0,0,0,1],#line 5
            [1,1,0,0,0,1,1,1,1,1,0,0,0,1],#line 6
            [1,1,0,0,0,1,1,1,1,1,0,0,0,1],#line 7
            [1,1,0,0,0,1,1,1,1,1,0,0,0,0],#line 8
            [1,1,0,0,0,1,1,1,1,1,0,0,0,0],#line 9
            [1,1,0,0,0,1,1,1,1,1,0,0,0,0],#line 10
            [1,1,0,0,0,1,1,1,1,1,0,0,0,1],#line 11
            [1,0,0,0,1,1,1,1,1,0,0,0,1,1],#line 12
            [1,0,0,0,1,1,1,1,1,0,0,0,1,1],#line 13
            [1,0,0,1,1,1,1,1,0,0,0,1,1,1],#line 14
            [0,0,0,1,1,1,1,1,0,0,0,1,1,1],#line 15
            [0,0,0,1,1,1,1,1,0,0,0,1,1,1],#line 16
            [0,0,0,0,1,1,1,0,0,0,1,1,1,1],#line 17
            [0,0,0,0,0,0,0,0,0,1,1,1,1,1],#line 18
            [1,0,0,0,0,0,0,0,1,1,1,1,1,1],#line 19
            [1,1,1,0,0,0,0,1,1,1,1,1,1,1],#line 20            
        ]
    contrast_1=[
            [1,1,1,1,1,0,0,0,1,1,1,1,1,1],#line 1
            [1,1,1,1,1,0,0,0,0,1,1,1,1,1],#line 2
            [1,1,1,1,1,0,0,0,0,0,1,1,1,1],#line 3
            [1,1,1,1,0,0,0,0,0,0,1,1,1,1],#line 4
            [1,1,1,1,0,0,0,0,0,0,0,1,1,1],#line 5
            [1,1,1,0,0,0,0,0,0,0,0,1,1,1],#line 6
            [1,1,1,0,0,0,1,0,0,0,0,1,1,1],#line 7
            [1,1,1,0,1,1,1,0,0,0,0,1,1,1],#line 8
            [1,1,1,1,1,1,1,1,0,0,0,1,1,1],#line 9
            [1,1,1,1,1,1,1,1,0,0,1,1,1,1],#line 10
            [1,1,1,1,1,1,1,0,0,0,1,1,1,1],#line 11
            [1,1,1,1,1,1,0,0,0,1,1,1,1,1],#line 12
            [1,1,1,1,1,1,0,0,0,1,1,1,1,1],#line 13
            [1,1,1,1,1,1,0,0,0,1,1,1,1,1],#line 14
            [1,1,1,1,1,1,0,0,0,1,1,1,1,1],#line 15
            [1,1,1,1,1,1,0,0,0,1,1,1,1,1],#line 16
            [1,1,1,1,1,1,0,0,0,1,1,1,1,1],#line 17
            [1,1,1,1,1,0,0,0,1,1,1,1,1,1],#line 18
            [1,1,1,1,1,0,0,0,1,1,1,1,1,1],#line 19
            [1,1,1,1,0,0,0,0,1,1,1,1,1,1],#line 20   
        ]
    contrast_2=[
            [1,1,0,0,0,0,0,1,1,1,1,1,1,1],#line 1
            [1,0,0,0,0,0,0,0,0,0,1,1,1,1],#line 2
            [1,0,0,0,0,0,0,0,0,0,0,0,1,1],#line 3
            [1,0,0,0,0,1,1,1,1,0,0,0,1,1],#line 4
            [1,1,0,0,0,1,1,1,1,1,0,0,0,1],#line 5
            [1,1,0,0,1,1,1,1,1,1,0,0,0,0],#line 6
            [1,1,1,1,1,1,1,1,1,1,1,0,0,0],#line 7
            [1,1,1,1,1,1,1,1,1,1,0,0,0,1],#line 8
            [1,1,1,1,1,1,1,1,1,0,0,0,0,1],#line 9
            [1,1,1,1,1,1,1,1,0,0,0,0,1,1],#line 10
            [1,1,1,1,1,1,1,0,0,0,0,1,1,1],#line 11
            [1,1,1,1,1,1,0,0,0,0,1,1,1,1],#line 12
            [1,1,1,1,1,0,0,0,0,1,1,1,1,1],#line 13
            [1,1,1,0,0,0,0,1,1,1,1,1,1,1],#line 14
            [1,0,0,0,0,1,1,1,1,1,1,1,1,1],#line 15
            [0,0,0,0,1,1,1,1,1,1,1,1,1,1],#line 16
            [0,0,0,0,1,1,1,1,1,1,1,1,1,1],#line 17
            [0,0,0,0,0,0,0,0,0,0,0,1,1,1],#line 18
            [0,0,0,0,0,0,0,0,0,0,0,1,1,1],#line 19
            [0,0,0,0,0,0,0,0,0,0,0,1,1,1],#line 20 
        ]    
    contrast_3=[
            [1,1,0,0,0,0,0,1,1,1,1,1,1,1],#line 1
            [1,1,0,0,0,0,0,0,0,1,1,1,1,1],#line 2
            [1,1,0,0,0,0,0,0,0,0,0,1,1,1],#line 3
            [1,0,0,0,0,1,1,1,0,0,0,0,1,1],#line 4
            [1,1,0,0,1,1,1,1,1,1,0,0,1,1],#line 5
            [1,1,1,1,1,1,1,1,1,1,0,0,0,1],#line 6
            [1,1,1,1,1,1,1,1,1,0,0,0,1,1],#line 7
            [1,1,1,1,1,1,1,1,0,0,0,1,1,1],#line 8
            [1,1,1,1,1,1,0,0,0,0,1,1,1,1],#line 9
            [1,1,1,1,1,1,0,0,0,0,0,0,1,1],#line 10
            [1,1,1,1,1,1,1,1,1,0,0,0,0,1],#line 11
            [1,1,1,1,1,1,1,1,1,0,0,0,1,1],#line 12
            [1,1,1,1,1,1,1,1,1,0,0,0,1,1],#line 13
            [1,1,1,1,1,1,1,1,1,0,0,0,1,1],#line 14
            [0,0,1,1,1,1,1,1,0,0,0,1,1,1],#line 15
            [0,0,0,1,1,1,1,1,0,0,0,1,1,1],#line 16
            [0,0,0,0,1,1,1,0,0,0,1,1,1,1],#line 17
            [0,0,0,0,0,0,0,0,0,1,1,1,1,1],#line 18
            [1,0,0,0,0,0,0,0,1,1,1,1,1,1],#line 19
            [1,1,0,0,0,0,0,1,1,1,1,1,1,1],#line 20 
        ]    
    contrast_4=[
            [1,1,1,1,1,1,0,0,0,1,1,1,1,1],#line 1
            [1,1,1,1,1,1,0,0,0,0,1,1,1,1],#line 2
            [1,1,1,1,1,1,0,0,0,0,0,1,1,1],#line 3
            [1,1,1,1,1,1,0,0,0,0,0,1,1,1],#line 4
            [1,1,1,1,1,1,1,0,0,0,0,0,1,1],#line 5
            [1,1,1,1,1,1,0,0,0,0,0,0,1,1],#line 6
            [1,1,1,1,1,0,0,0,1,0,0,0,1,1],#line 7
            [1,1,1,1,1,0,0,1,1,0,0,0,1,1],#line 8
            [1,1,1,1,0,0,1,1,1,0,0,0,1,1],#line 9
            [1,1,1,0,0,0,1,1,1,0,0,0,1,1],#line 10
            [1,1,1,0,0,1,1,1,1,0,0,0,1,1],#line 11
            [1,0,0,0,1,1,1,1,0,0,0,1,1,1],#line 12
            [1,0,0,1,1,1,1,1,0,0,0,1,1,1],#line 13
            [0,0,0,0,0,0,0,0,0,0,0,0,1,1],#line 14
            [0,0,0,0,0,0,0,0,0,0,0,0,1,1],#line 15
            [0,0,0,0,0,0,0,0,0,0,0,0,1,1],#line 16
            [1,1,1,1,1,1,1,0,0,0,1,1,1,1],#line 17
            [1,1,1,1,1,1,0,0,0,1,1,1,1,1],#line 18
            [1,1,1,1,1,1,0,0,0,1,1,1,1,1],#line 19
            [1,1,1,1,1,1,0,0,0,1,1,1,1,1],#line 20 
        ]
    contrast_5=[
            [1,0,0,0,0,0,0,0,0,0,1,1,1,1],#line 1
            [1,0,0,0,0,0,0,0,0,0,0,1,1,1],#line 2
            [1,1,1,0,0,0,0,0,0,0,0,0,1,1],#line 3
            [1,1,1,0,0,1,1,1,1,1,1,1,1,1],#line 4
            [1,1,1,0,0,0,1,1,1,1,1,1,1,1],#line 5
            [1,1,1,0,0,0,1,1,1,1,1,1,1,1],#line 6
            [1,1,1,0,0,0,0,0,0,0,1,1,1,1],#line 7
            [1,1,1,0,0,0,0,0,0,0,0,0,1,1],#line 8
            [1,1,0,0,0,0,0,0,0,0,0,0,0,1],#line 9
            [1,1,0,0,0,1,1,1,1,1,0,0,0,1],#line 10
            [1,1,1,1,1,1,1,1,1,1,0,0,0,1],#line 11
            [1,1,1,1,1,1,1,1,1,1,0,0,0,1],#line 12
            [1,1,1,1,1,1,1,1,1,1,0,0,0,1],#line 13
            [1,1,1,1,1,1,1,1,1,0,0,0,1,1],#line 14
            [1,1,1,1,1,1,1,1,0,0,0,1,1,1],#line 15
            [0,0,1,1,1,1,1,1,0,0,0,1,1,1],#line 16
            [0,0,0,1,1,1,1,0,0,0,0,1,1,1],#line 17
            [1,0,0,0,0,0,0,0,0,0,1,1,1,1],#line 18
            [1,0,0,0,0,0,0,0,0,1,1,1,1,1],#line 19
            [1,1,0,0,0,0,0,1,1,1,1,1,1,1],#line 20 
        ]        
    contrast_6=[
            [1,1,1,0,0,0,0,1,1,1,1,1,1,1],#line 1
            [1,1,1,0,0,0,0,0,0,0,1,1,1,1],#line 2
            [1,1,0,0,0,0,0,0,0,0,0,0,1,1],#line 3
            [1,1,0,0,0,0,1,1,1,0,0,0,1,1],#line 4
            [1,1,0,0,0,0,1,1,1,1,0,0,0,1],#line 5
            [1,1,0,0,0,1,1,1,1,1,1,1,1,1],#line 6
            [1,1,0,0,0,1,1,1,1,1,1,1,1,1],#line 7
            [1,1,0,0,0,1,1,0,0,0,0,1,1,1],#line 8
            [1,1,0,0,0,0,0,0,0,0,0,0,1,1],#line 9
            [1,1,1,0,0,0,0,0,0,0,0,0,0,1],#line 10
            [1,1,0,0,0,0,1,1,1,1,0,0,0,1],#line 11
            [1,0,0,0,0,1,1,1,1,1,0,0,0,1],#line 12
            [1,0,0,0,1,1,1,1,1,1,0,0,1,1],#line 13
            [0,0,0,1,1,1,1,1,1,0,0,0,1,1],#line 14
            [0,0,0,1,1,1,1,1,1,0,0,0,1,1],#line 15
            [0,0,0,0,1,1,1,1,1,0,0,1,1,1],#line 16
            [0,0,0,0,1,1,1,1,0,0,0,1,1,1],#line 17
            [1,0,0,0,0,0,0,0,0,0,1,1,1,1],#line 18
            [1,0,0,0,0,0,0,0,0,1,1,1,1,1],#line 19
            [1,1,1,0,0,0,0,1,1,1,1,1,1,1],#line 20 
        ]      
    contrast_7=[
            [0,0,0,0,0,0,0,0,0,0,0,1,1,1],#line 1
            [0,0,0,0,0,0,0,0,0,0,0,0,1,1],#line 2
            [1,0,0,0,0,0,0,0,0,0,0,0,0,1],#line 3
            [1,1,1,1,1,1,1,1,1,0,0,0,0,1],#line 4
            [1,1,1,1,1,1,1,1,1,0,0,0,1,1],#line 5
            [1,1,1,1,1,1,1,1,1,0,0,0,1,1],#line 6
            [1,1,1,1,1,1,1,1,0,0,0,1,1,1],#line 7
            [1,1,1,1,1,1,1,0,0,0,0,1,1,1],#line 8
            [1,1,1,1,1,1,1,0,0,0,1,1,1,1],#line 9
            [1,1,1,1,1,1,0,0,0,0,1,1,1,1],#line 10
            [1,1,1,1,1,1,0,0,0,1,1,1,1,1],#line 11
            [1,1,1,1,1,0,0,0,1,1,1,1,1,1],#line 12
            [1,1,1,1,0,0,0,1,1,1,1,1,1,1],#line 13
            [1,1,1,1,0,0,1,1,1,1,1,1,1,1],#line 14
            [1,1,1,0,0,0,1,1,1,1,1,1,1,1],#line 15
            [1,1,1,0,0,1,1,1,1,1,1,1,1,1],#line 16
            [1,1,0,0,0,1,1,1,1,1,1,1,1,1],#line 17
            [1,0,0,0,1,1,1,1,1,1,1,1,1,1],#line 18
            [1,0,0,0,1,1,1,1,1,1,1,1,1,1],#line 19
            [1,0,0,0,1,1,1,1,1,1,1,1,1,1],#line 20 
        ]
    contrast_8=[
            [1,1,1,1,0,0,0,0,0,1,1,1,1,1],#line 1
            [1,1,1,0,0,0,0,0,0,0,1,1,1,1],#line 2
            [1,1,0,0,0,0,0,0,0,0,0,1,1,1],#line 3
            [1,0,0,0,0,1,1,1,1,0,0,0,1,1],#line 4
            [1,1,0,0,0,1,1,1,1,1,0,0,0,1],#line 5
            [1,1,0,0,0,1,1,1,1,1,0,0,0,1],#line 6
            [1,1,0,0,0,1,1,1,1,1,0,0,0,1],#line 7
            [1,1,1,0,0,0,1,1,1,0,0,0,0,1],#line 8
            [1,1,1,1,0,0,0,0,0,0,0,0,1,1],#line 9
            [1,1,1,1,1,0,0,0,0,0,0,1,1,1],#line 10
            [1,1,1,0,0,0,0,0,0,0,0,0,1,1],#line 11
            [1,0,0,0,0,1,1,1,1,0,0,0,1,1],#line 12
            [0,0,0,0,1,1,1,1,1,0,0,0,1,1],#line 13
            [0,0,0,1,1,1,1,1,1,0,0,0,1,1],#line 14
            [0,0,1,1,1,1,1,1,0,0,0,1,1,1],#line 15
            [0,0,0,1,1,1,1,1,0,0,0,1,1,1],#line 16
            [0,0,0,0,1,1,1,1,0,0,0,1,1,1],#line 17
            [0,0,0,0,0,0,0,0,0,0,1,1,1,1],#line 18
            [1,0,0,0,0,0,0,0,1,1,1,1,1,1],#line 19
            [1,1,0,0,0,0,0,1,1,1,1,1,1,1],#line 20 
        ]    
    contrast_9=[
            [1,1,1,0,0,0,0,1,1,1,1,1,1,1],#line 1
            [1,1,0,0,0,0,0,0,0,1,1,1,1,1],#line 2
            [1,1,0,0,0,0,0,0,0,0,0,1,1,1],#line 3
            [1,1,0,0,0,1,1,1,0,0,0,0,1,1],#line 4
            [1,1,0,0,0,1,1,1,1,1,0,0,0,1],#line 5
            [1,1,0,0,0,1,1,1,1,1,0,0,0,1],#line 6
            [1,1,0,0,0,1,1,1,1,1,0,0,0,1],#line 7
            [1,0,0,0,0,1,1,1,1,1,0,0,0,0],#line 8
            [1,1,0,0,0,1,1,1,1,1,0,0,0,1],#line 9
            [1,1,0,0,0,0,1,1,1,1,0,0,0,1],#line 10
            [1,1,1,0,0,0,0,0,0,0,0,0,0,1],#line 11
            [1,1,1,0,0,0,0,0,0,0,0,0,0,1],#line 12
            [1,1,1,1,1,0,0,1,1,0,0,0,1,1],#line 13
            [1,1,1,1,1,1,1,1,0,0,0,1,1,1],#line 14
            [1,1,1,1,1,1,1,1,0,0,0,1,1,1],#line 15
            [0,0,1,1,1,1,1,1,0,0,1,1,1,1],#line 16
            [0,0,0,1,1,1,1,0,0,0,1,1,1,1],#line 17
            [0,0,0,0,0,0,0,0,0,1,1,1,1,1],#line 18
            [1,0,0,0,0,0,0,0,1,1,1,1,1,1],#line 19
            [1,1,0,0,0,0,1,1,1,1,1,1,1,1],#line 20 
        ]        
    
    contrast_imgs=[contrast_0,contrast_1,contrast_2,contrast_3,contrast_4,contrast_5,
        contrast_6,contrast_7,contrast_8,contrast_9]
    ret_code=""
    for item in normalizedImgs:
        offset_min = 14*20
        code_num = 0
        code_num_near = 0
        for number,standard in enumerate(contrast_imgs) :
            offset = contrastImage(item,standard)
            if offset < offset_min :
                code_num_near = code_num
                offset_min = offset
                code_num = number
            if offset_min == 0 :
                break
            # adjust 5 and 6        
            #if (code_num==5 and code_num_near == 6 ) or (code_num==6 and code_num_near == 5):
            # if code_num==5 or code_num==6:
                # lp_7=7
                # lp_8=7
                # for i in range(0,8):
                    # if item[7][i]==0:
                        # lp_7=i
                        # break
                # for i in range(0,8):
                    # if item[8][i]==0:
                        # lp_8=i
                        # break
                # if lp_7+lp_8>9:
                    # code_num=5
                # else:
                    # code_num=6
            
            # if (code_num==7 and code_num_near == 1 ) or (code_num==1 and code_num_near == 7):
                # if tp(0) == 12 or tp(7) == 12:
                    # code_num==1
                # else:
                    # code_num==7
                        
        ret_code = ret_code + str(code_num)
            
                    
    return ret_code
    
def tp(source,i):
    tp_i=len(source)
    for j in range(0,len(source)):
        if source[j][i]==0:
            tp_i=j
            break
    return tp_i

def rp(source,j):
    rp_j=-1
    for i in range(0,len(source[0])):
        if source[j][len(source[0])-1-i]==0:
            rp_j=i
            break
    return rp_j    
    
def sharpen(source):
    for j in range(0,len(source)):
        for i in range(0,len(source[0])):
            if beAlone(source,i,j) :
                source[j][i]=(source[j][i]+1)%2
    return source

def beAlone(source,i,j):
    if source[j][i]==0 and getLeft(source,i,j)==1 and getRight(source,i,j)==1 and getTop(source,i,j)==1 and getBottom(source,i,j)==1:
        return True
    elif source[j][i]==1 and getLeft(source,i,j)==0 and getRight(source,i,j)==0 and getTop(source,i,j)==0 and getBottom(source,i,j)==0:
        return True
    else:
        return False

def getLeft(source,i,j):
    if i<=0:
        return 1
    else:
        return source[j][i-1]
def getRight(source,i,j):
    if i>=len(source[0])-1:
        return 1
    else:
        return source[j][i+1]        
def getTop(source,i,j):
    if j<=0:
        return 1
    else:
        return source[j-1][i]
def getBottom(source,i,j):
    if j>=len(source)-1:
        return 1
    else:
        return source[j+1][i]            
    
def contrastImage(source,standard):
    offset = 0
    for j in range(0,len(standard)) :
        for i in range(0,len(standard[0])) :
            if source[j][i] != standard[j][i] :
                offset = offset + 1
    
    return offset    


    #normalizedImgs  
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

def newIsPointIn(i,j):
    if j>=7 and j<=26 :
        if ( i>=10 and i<=23 ) or ( i>=25 and i<=38 ) or ( i>=40 and i<=53 ) or ( i>=55 and i<=68 ) :
            return True
    return False    
    
def cutter(imgData,checkpoint) :
    output = [] 
    for j in range(0,len(imgData)) :
        output_r =[]
        for i in range(0,len(imgData[0])/4) :
            if checkpoint(i,j):
                r=imgData[j][i*4]
                g=imgData[j][i*4+1]
                b=imgData[j][i*4+2]
                alpha=imgData[j][i*4+3]   
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

def uncrook(imgData) :
    output = [] 
    for j in range(0,17) :
        output_r =[]
        for i in range(0,len(imgData[0])) :
            output_r.append(imgData[j][i])
        output.append(output_r)
    
    for j in range(17,21) :
        output_r =[]
        for i in range(0,len(imgData[0])/4):
            newi=i-1
            if newi <0 :
                newi=0
            r=imgData[j][newi*4]
            g=imgData[j][newi*4+1]
            b=imgData[j][newi*4+2]
            alpha=imgData[j][newi*4+3]   
            
            output_r.append(r)
            output_r.append(g)
            output_r.append(b)
            output_r.append(alpha)
        output.append(output_r)
    for j in range(21,23) :
        output_r =[]
        for i in range(0,len(imgData[0])/4):
            newi=i-2
            if newi <0 :
                newi=0
            r=imgData[j][newi*4]
            g=imgData[j][newi*4+1]
            b=imgData[j][newi*4+2]
            alpha=imgData[j][newi*4+3]   
            
            output_r.append(r)
            output_r.append(g)
            output_r.append(b)
            output_r.append(alpha)
        output.append(output_r)
        
    for j in range(23,25) :
        output_r =[]
        for i in range(0,len(imgData[0])/4):
            newi=i-3
            if newi <0 :
                newi=0
            r=imgData[j][newi*4]
            g=imgData[j][newi*4+1]
            b=imgData[j][newi*4+2]
            alpha=imgData[j][newi*4+3]   
            
            output_r.append(r)
            output_r.append(g)
            output_r.append(b)
            output_r.append(alpha)
        output.append(output_r)
        
    for j in range(25,27) :
        output_r =[]
        for i in range(0,len(imgData[0])/4):
            newi=i-4
            if newi <0 :
                newi=0
            r=imgData[j][newi*4]
            g=imgData[j][newi*4+1]
            b=imgData[j][newi*4+2]
            alpha=imgData[j][newi*4+3]   
            
            output_r.append(r)
            output_r.append(g)
            output_r.append(b)
            output_r.append(alpha)
        output.append(output_r)
        
        
    for j in range(27,32) :
        output_r =[]
        for i in range(0,len(imgData[0])) :
            output_r.append(imgData[j][i])
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