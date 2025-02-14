rainbow_str =  "#BF0000,#C51717,#CB2E2E,#D04646,#D65D5D,#DC7474,#E28B8B,#E8A2A2,#EEB9B9,#F3D1D1,#F9E8E8,#FFFFFF"
rainbow_str += "#FFFFFF,#E8EBF1,#D1D8E4,#B9C4D6,#A2B1C8,#8B9DBA,#748AAD,#5D769F,#466391,#2E4F83,#173C76,#002868"
rainbow_str += "#002868,#173C76,#2E4F83,#466391,#5D769F,#748AAD,#8B9DBA,#A2B1C8,#B9C4D6,#D1D8E4,#E8EBF1,#FFFFFF"
rainbow_str += "#FFFFFF,#F9E8E8,#F3D1D1,#EEB9B9,#E8A2A2,#E28B8B,#DC7474,#D65D5D,#D04646,#CB2E2E,#C51717,#BF0000"

stream_timing = "60"
swell_timing = "60"
prepend_stream = "USA.append(\""
prepend_swell = "USA_Swell.append(\""
append = "\")"
from collections import deque
def hex_to_rgb(hex):
    hex = hex.lstrip('#')
    rgb = tuple(int(hex[i:i+2], 16) for i in (0, 2 ,4))
    return rgb

dim_factor = .5
rainbow = []
#rainbow_str = "#f80c12,#ee1100,#ff3311,#ff4422,#ff6644,#ff9933,#feae2d,#ccbb33,#d0c310,#aacc22,#69d025,#22ccaa,#12bdb9,#11aabb,#4444dd,#3311bb,#3b0cbd,#442299"
rainbow_list_tmp = rainbow_str.split(",")
for rb in rainbow_list_tmp:
    junk = list(hex_to_rgb(rb))
    junk = tuple([int(junk[0]*dim_factor), int(junk[1]*dim_factor), int(junk[2]*dim_factor)])
    rainbow.append(junk)

rb_temp = deque(rainbow)

# Print out swell style pattern
for i in range(0, len(rainbow)):
    print( \
    	prepend_swell+ \
        str(rb_temp[i][0])+","+str(rb_temp[i][1])+","+str(rb_temp[i][2])+","+ \
        str(rb_temp[i][0])+","+str(rb_temp[i][1])+","+str(rb_temp[i][2])+","+ \
        str(rb_temp[i][0])+","+str(rb_temp[i][1])+","+str(rb_temp[i][2])+","+ \
        str(rb_temp[i][0])+","+str(rb_temp[i][1])+","+str(rb_temp[i][2])+","+ \
        str(rb_temp[i][0])+","+str(rb_temp[i][1])+","+str(rb_temp[i][2])+","+swell_timing+ \
        append
    )

# Print out stream style pattern
for i in range(0, len(rainbow)+1):
    print( \
    	prepend_stream+ \
        str(rb_temp[0][0])+","+str(rb_temp[0][1])+","+str(rb_temp[0][2])+","+ \
        str(rb_temp[1][0])+","+str(rb_temp[1][1])+","+str(rb_temp[1][2])+","+ \
        str(rb_temp[2][0])+","+str(rb_temp[2][1])+","+str(rb_temp[2][2])+","+ \
        str(rb_temp[3][0])+","+str(rb_temp[3][1])+","+str(rb_temp[3][2])+","+ \
        str(rb_temp[4][0])+","+str(rb_temp[4][1])+","+str(rb_temp[4][2])+","+stream_timing+ \
        append
    )
    rb_temp.rotate(1)

#print(str(rainbow))