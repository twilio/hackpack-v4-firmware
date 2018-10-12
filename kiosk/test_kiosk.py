import kiosk
import time

a = kiosk.Api()

print("Touch")
print(a.changeTouchscreenMode("{}"))
print(a.changeTouchscreenMode("{u'xy': 1, u'lr': 0, u'ud': 0}"))


print("Check WiFi")
print(a.checkWifiConnection("{}"))

print("Get, set, get auth")
print("Remove Auth Token")
print(a.removeAuthToken("{}"))
time.sleep(5)
print("Get")
print(a.getAuthToken("{}"))
print("Set")
print(a.setAuthToken("{u'authToken': u'sfggsfgssfdggsfgfs'}"))
print("Get")
print(a.getAuthToken("{}"))

print("Set and get")
print(a.set("{u'data': u'12345', u'key': u'test'}"))
print(a.get("{u'key': u'test'}"))
print("Remove All Temp then Get")
print(a.removeAllTempStorage("{}"))
print(a.get("{u'key': u'test'}"))

print("IP")
print(a.getIpAddress("{}"))

print("HWID")
print(a.getHardwareId("{}"))

print("Rand")
print(a.getRandomNumber("{}"))

print("Arrow")
print(a.inputArrow("{}"))

print("Cursor")
print(a.inputCursor("{}"))

print("Scanner")
print(a.showLights("{}"))
time.sleep(5)

# print("Doom")
# print(a.launchDoom("{}"))

# print("Micropolis")
# print(a.launchMicropolis("{}"))

# print("OpenTTD")
# print(a.launchOpenTTD("{}"))

print("Stock lights")
print(a.showLightsParams("{u'demo': 3, u'repeat': 2}"))
time.sleep(5)

print("Bad add")
print(a.addLightCommand("128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,30"));

print("Custom lights")
print(a.clearLightSequence("{}"))
print(a.addLightCommand("{u'message': '128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,4000'}"));
print(a.lightLights("{}"))
time.sleep(5)

print("Lights off")
print(a.lightsOff("{}"))
