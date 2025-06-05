print("starting up...")

rednet.open("right")

local controller = peripheral.wrap("top")

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
}

local function readWs()
  while true do
    local id, message = rednet.receive()
    print(message)
    local speed = message.speed
    if speed >= 1 then
      speed = 1
    elseif speed <= 0 then
      speed = 0
    end
    controller.setTargetSpeed(speed * 100)
  end
end

parallel.waitForAny(readWs)
