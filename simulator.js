const { time } = require("console")
const kafkaPublisher = require('./kafkaProduce');
const axios = require('axios');

// function returns a random number in a given range 
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// write event with given 6 parameters in a json format
function writeEvent(et, seg, id, vt, dotw, time, sd){
    var weekdays = ['Sunday', 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var type = ['Private', 'Comercial', 'Truck'];
    // create a JSON object
    const event = {
        "Event_type": et,
        "Segment": seg,
        "id" : id,
        "vehicle_type": type[vt],
        "Day_of_the_week" : weekdays[dotw],
        "Time": time,
        "Special_day": sd
    };
    // console.log(event);

    kafkaPublisher.publish(event);
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// returns random key from Set or Map
function getRandomKey(collection) {
    let keys = Array.from(collection.keys());
    return keys[Math.floor(Math.random() * keys.length)];
}

//////////////////// MAIN SIMULATOR ////////////////////////////////////////

module.exports.run= async function(){
    axios.post('http://localhost:3000/services', {
        service: "simulator",
        msg: "starting simulator"
    });
    //create segments and segment array
    const seg1 = new Map();
    const seg2 = new Map();
    const seg3 = new Map();
    const seg4 = new Map();
    const seg5 = new Map();

    var segarr = [seg1,seg2,seg3,seg4,seg5]

    // decide if its a special day in a 1/5 chance
    var spec = getRandomInt(5);
    var isSpecialDay = false;
    if (spec == 4){
        isSpecialDay = true;
    }

    var dateObj = new Date();
    var dayofweek = getRandomInt(7);
    var currentid = 0;

    // enter 10 cars to the road
    for (var i = 0; i < 10; i++){
        var time = dateObj.getHours() + ":" + dateObj.getMinutes() + ":" + dateObj.getSeconds();
        var seg = getRandomInt(5) +1; // entry segment
        var vehicletype = getRandomInt(3); // private, truck, comercial 
        var id = currentid;
        currentid++;
        
        writeEvent("road entry", seg, id, vehicletype,dayofweek,time,isSpecialDay);
        writeEvent("segment entry",seg, id, vehicletype,dayofweek,time,isSpecialDay);
        segarr[seg-1].set(currentid,vehicletype);
    }

    while(1){
        var time = dateObj.getHours() + ":" + dateObj.getMinutes() + ":" + dateObj.getSeconds();
        ev = getRandomInt(2); //0- road entry, 1 segment exit
        // road entry
        if(ev == 0){
            var seg = getRandomInt(5) +1; // entry segment
            var vehicletype = getRandomInt(3); // private, truck, comercial
            var id = currentid;
            currentid++;
            
            writeEvent("road entry", seg, id, vehicletype,dayofweek,time,isSpecialDay);
            writeEvent("segment entry",seg, id, vehicletype,dayofweek,time,isSpecialDay);
            segarr[seg-1].set(currentid,vehicletype);
        }
        
        //segment exit
        else{ 
            var seg = getRandomInt(5)+1;
            // no exit from empty segment
            while (segarr[seg-1].size == 0){
                seg = getRandomInt(5)+1;
            }

            var id = getRandomKey(segarr[seg-1]);
            var vehicletype = segarr[seg-1].get(id); // private, truck, comercial 
            
            if (seg ==5 ){//exit road 
                writeEvent("segment exit", seg,id,vehicletype,dayofweek,time,isSpecialDay);
                segarr[seg-1].delete(id)
                writeEvent("road exit",seg,id, vehicletype,dayofweek,time,isSpecialDay);
            }
            else{
                if (vehicletype == 0) //private car
                    ev = getRandomInt(4) //1/4 chances to stay 
                else{ //truck or comercial 
                    ev = getRandomInt(2)//1/2 chances to stay 
                }

                if(ev == 0){ //next segment
                    writeEvent("segment exit", seg, id,vehicletype,dayofweek,time,isSpecialDay);
                    writeEvent("segment enrty",seg+1, id,vehicletype,dayofweek,time,isSpecialDay);
                    segarr[seg-1].delete(id);//get viechel out of exit segment set
                    segarr[seg].set(id,vehicletype);//get veichel into new segment set
                }

                else{ //road exit
                    writeEvent("segment exit", seg, id, vehicletype,dayofweek,time,isSpecialDay);
                    writeEvent("road exit",seg,id, vehicletype,dayofweek,time,isSpecialDay);
                    segarr[seg-1].delete(id);
                }
            }
        }
        var sleeptime = getRandomInt(5) + 2;
        //less cars in a special day 
        await sleep(sleeptime*1000);
    }
}
