print("starting up...")

rednet.open("top")

local tank = peripheral.wrap("back")
local monitor = peripheral.wrap("right")

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

local function readWs()
  while true do
    local id, _ = rednet.receive()
    rednet.send(id, { level = tank.tanks()[1].amount, capacity = 576000 })
    monitor.clear()
    monitor.setCursorPos(1, 1)
    monitor.write("amount: " .. tank.tanks()[1].amount)
    monitor.setCursorPos(1, 2)
    monitor.write("capacity: " .. 576000)
  end
end

parallel.waitForAny(readWs)
