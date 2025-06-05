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

local function readWs()
  while true do
    local message = ws.receive()
    -- parse the message to a table
    local messageTable = textutils.unserializeJSON(message)
    local topic = messageTable.topic
    local value = messageTable.payload

    if topic == "sugar_enable" then
        redstone.setOutput("back",  not value)
    end

    -- local
    print(message)
  end
end

parallel.waitForAny(readWs)
