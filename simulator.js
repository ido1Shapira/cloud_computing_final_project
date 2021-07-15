const { time } = require("console")
const fs = require('fs');

class Vehicle{
    constructor(vehicleType, id){
        this.vehicaleType = vehicleType
        this.id = id
    }

}

class Segment{
    constructor(id){
        this.id = id
        const veachleset = new Set()
        privateNum = 0
        comercialNum = 0
        trucksNum = 0
    }
	
    
	addviechel(Vehicle){
        veachleset.add(viechel)
        if (viechel.vehicleType == )
    }
        
	removeviechel(viechel){
        veachleset.remove(viechel)
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  
function writeEvent(et, seg, vt, dotw, time, sd){
    let weekdays = ['Sunday', 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

    // create a JSON object
    const user = {
        "Event type": et,
        "Segment": seg,
        "vehicle type": vt,
        "Day of the week" : weekdays[dotw-1],
        "Time": time,
        "Special day?": sd
    };

    // convert JSON object to string
    const data = JSON.stringify(user);

    // write JSON string to a file
    fs.writeFile('user.json', data, (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved.");
    });
}

function main(){

    //create segments and segment array
    var seg1 = new segment()
    var seg2 = new segment()
    var seg3 = new segment()
    var seg4 = new segment()
    var seg5 = new segment()

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
        sleep(rand) //todo
        var time = dateObj.getHours() + ":" + dateObj.getMinutes() + ":" + dateObj.getSeconds();
        ev = getRandomInt(2) //0- road entry, 1 segment exit
        
        if(ev == 0){ // road entry
            let seg = getRandomInt(5) +1 // entry segment
            let viecheltype = getRandomInt(3) // private, truck, comercial 
            let id = currentid
            currentid++
            segarr[seg].addviechel(id, type)
            
            writeEvent("road entry", seg,viecheltype,dayofweek,time,isSpecialDay)
            writeEvent("segment entry",seg,viecheltype,dayofweek,time,isSpecialDay)
            segarr[seg-1].addviechel()
        }

        else{ //segment exit
            let seg = getRandomInt(5)+1
             
            if (seg ==5 ){//exit road 
                writeEvent("segment exit", seg,viecheltype,dayofweek,time,isSpecialDay)
                segarr[seg-1].removeviechel()
                writeEvent("road exit",seg,viecheltype,dayofweek,time,isSpecialDay)
            }
            else{
                ev = getRandomInt(2) //0- next segment, 1 road exit
                if(ev == 0){ //next segment
                    writeEvent("segment exit", seg,viecheltype,dayofweek,time,isSpecialDay)
                    writeEvent("segment enrty",seg+1,viecheltype,dayofweek,time,isSpecialDay)
                    segarr[seg-1].removeviechel()//get viechel out of exit segment set
                    segarr[seg].addviechel()//get veichel into new segment set
                }

                else{
                    writeEvent("segment exit", seg,viecheltype,dayofweek,time,isSpecialDay)
                    writeEvent("road exit",seg,viecheltype,dayofweek,time,isSpecialDay)
                    segarr[seg-1].removeviechel()
                }
            }

            
        }
    }

}