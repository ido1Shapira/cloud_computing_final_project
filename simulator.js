const { time } = require("console")
const fs = require('fs');

// function returns a random number in a given range 
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// write event with given 6 parameters in a json format
function writeEvent(et, seg, id, vt, dotw, time, sd){
    let weekdays = ['Sunday', 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    let type = ['Private', 'Comercial', 'Truck']
    // create a JSON object
    const event = {
        "Event type": et,
        "Segment": seg,
        "ID" : id,
        "vehicle type": type[vt],
        "Day of the week" : weekdays[dotw-1],
        "Time": time,
        "Special day?": sd
    };

    // convert JSON object to string
    const data = JSON.stringify(event);

    // write JSON string to a file
    fs.writeFile('user.json', data, (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved.");
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


//////////////////// MAIN SIMULATOR ////////////////////////////////////////

console.log('starting simulator')
//create segments and segment array
const seg1 = new Map()
const seg2 = new Map()
const seg3 = new Map()
const seg4 = new Map()
const seg5 = new Map()

var segarr = [seg1,seg2,seg3,seg4,seg5]

// decide if its a special day in a 1/5 chance
let spec = getRandomInt(5);
let isSpecialDay = false;
if (spec == 4){
    isSpecialDay = true
}


var dateObj = new Date();
var dayofweek = dateObj.getDay

while(1){
    let currentid = 0

    let sleeptime = getRandomInt(5)
    await sleep(sleeptime);
    var time = dateObj.getHours() + ":" + dateObj.getMinutes() + ":" + dateObj.getSeconds();
    ev = getRandomInt(2) //0- road entry, 1 segment exit
    
    // road entry
    if(ev == 0){
        let seg = getRandomInt(5) +1 // entry segment
        let vehicletype = getRandomInt(3) // private, truck, comercial 
        let id = currentid
        currentid++
        segarr[seg].addviechel(id, type)
        
        writeEvent("road entry", seg,viecheltype,dayofweek,time,isSpecialDay)
        writeEvent("segment entry",seg,viecheltype,dayofweek,time,isSpecialDay)
        segarr[seg-1].set(currentid,vehicletype)
    }
    
    //segment exit
    else{ 
        let seg = getRandomInt(5)+1
        randeomCar = getRandomInt(segarr[seg-1].size)
        let id = segarr[seg-1][randeomCar]
        let vehicletype = segarr[seg-1].get(id) // private, truck, comercial 
        
        if (seg ==5 ){//exit road 
            writeEvent("segment exit", seg,id,vehicletype,dayofweek,time,isSpecialDay)
            segarr[seg-1].delete(id)
            writeEvent("road exit",seg,id, vehicletype,dayofweek,time,isSpecialDay)
        }
        else{
            ev = getRandomInt(2) //0- next segment, 1 road exit
            if(ev == 0){ //next segment
                writeEvent("segment exit", seg,id,vehicletype,dayofweek,time,isSpecialDay)
                writeEvent("segment enrty",seg+1,id,vehicletype,dayofweek,time,isSpecialDay)
                segarr[seg-1].delete(id)//get viechel out of exit segment set
                segarr[seg].set(id,vehicletype)//get veichel into new segment set
            }

            else{
                writeEvent("segment exit", seg,viecheltype,dayofweek,time,isSpecialDay)
                writeEvent("road exit",seg,viecheltype,dayofweek,time,isSpecialDay)
                segarr[seg-1].delete(id)
            }
        }

        
    }
}
