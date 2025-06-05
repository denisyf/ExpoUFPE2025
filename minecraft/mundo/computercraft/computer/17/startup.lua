print("starting up...")

rednet.open("top")

local ws = assert(http.websocket("ws://localhost:1880/ws/minecraft"))

local computers = {
    main = 1,
    cocoa = 14,
    sugar = 15,
    milk = 16,
    chocolate = 17,
    milk_fill = 18,
    milk_empty = 19,
    chocolate_fill = 20,
    chocolate_empty = 21,
    milk_tank_low = 22,
    milk_tank_medium = 26,
    milk_tank_high = 27,
    chocolate_tank_low = 28,
    chocolate_tank_medium = 29,
    chocolate_tank_high = 30,
  }

local chocolateTank = {
    volumeLow = 0,
    volumeMedium = 0,
    volumeHigh = 0,
}

local function readWs()
  while true do
    local message = ws.receive()
    -- parse the message to a table
    local messageTable = textutils.unserializeJSON(message)
    local topic = messageTable.topic
    local value = messageTable.payload

    if topic == "chocolate_tank_config" then
        if value.mode == "auto" then
            redstone.setOutput("back",  false)
            rednet.send(computers.chocolate_fill, {
                speed = 0,
            })
            rednet.send(computers.chocolate_empty, {
                speed = 0,
            })
        else 
            redstone.setOutput("back",  true)
            rednet.send(computers.chocolate_fill, {
                speed = value.fill_speed,
            })
            rednet.send(computers.chocolate_empty, {
                speed = value.empty_speed,
            })
        end
        
    end

    -- local
    print(message)
  end
end

local function sendWs()
    while true do
      -- get milk tank low, medium and high levels
      rednet.send(computers.chocolate_tank_low, nil)
      local _, msg_low = rednet.receive()
      rednet.send(computers.chocolate_tank_medium, nil)
      _, msg_medium = rednet.receive()
      rednet.send(computers.chocolate_tank_high, nil)
      _, msg_high = rednet.receive()
  
      local total_volume = (msg_low.level + msg_medium.level + msg_high.level)/(msg_low.capacity + msg_medium.capacity + msg_high.capacity)
      local message= {
        topic = "chocolate_tank_level",
        payload = total_volume
      }
      ws.send(textutils.serializeJSON(message))
      os.sleep(1)
    end
  end 
  
  parallel.waitForAny(readWs, sendWs)