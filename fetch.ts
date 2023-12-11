




export{}


const res = await fetch("http://localhost:3000/nest/../robot.txt",{
  // method: "POST",
  // body: "Hello World",
  // headers: { "oof": "123", referrer: "nice" },
})

console.log(await res.text())


