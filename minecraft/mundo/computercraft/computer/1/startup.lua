print("starting up...")
rednet.open("top")

local ws = assert(http.websocket("ws://localhost:1880/ws/minecraft"))

local computers = {
  main = 1,
  cocoa = 14,
  sugar = 15,
  milk = 16,
  chocolate = 17
}

local previous_requiring_value = 0

redstone.setOutput("left",  true)

local function readWs()
  while true do
    local message = ws.receive()
    -- parse the message to a table
    local messageTable = textutils.unserializeJSON(message)
    local topic = messageTable.topic
    local value = messageTable.payload

    if topic == "factory_requiring_box" then
        print("Requiring box".. value)

        if value == 1 then
            previous_requiring_value = 1
        else
            if previous_requiring_value == 1 then
                print("preparing box")
                redstone.setOutput("left",  false)
                os.sleep(5)
                redstone.setOutput("left",  true)
            end
            previous_requiring_value = 0
        end
    end

    -- local
    print(message)
  end
end

local previous_sensor_value = 0

local function boxSensing()
  while true do
    local boxEnabled = redstone.getInput("back")
    if boxEnabled then
    print("box enabled")
      previous_sensor_value = 1
    else
        print("box disabled")
        if previous_sensor_value == 1 then
            print("sending box")
            local message = {
                topic = "factory_sending_box",
                payload = 1
            }
            ws.send(textutils.serializeJSON(message))
            os.sleep(1)
            local message = {
                topic = "factory_sending_box",
                payload = 0
            }
            previous_sensor_value = 0
            ws.send(textutils.serializeJSON(message))
        end
      previous_sensor_value = 0
    end
    os.sleep(0.2)
  end
end

parallel.waitForAny(readWs, boxSensing)
