const MIN_FLOOR = 0;
const MAX_FLOOR = 10;

const DEFAULT_FLOOR = 0;

class Maalit {
    constructor(name) {
        this.name = name;
        this.working = false;
        this.run = false;
        this.direction = 'up';
        this.opened = false;
        this.floor = MIN_FLOOR;
        this.pressed = [];
        this.timerCloseTheDoor;
        this.timerTurnOffTheLight;
    }

    press(number) {
        let temp = this.pressed;
        this.pressed = [...this.pressed, ...[number]];
        if (temp.length !== this.pressed.length) {
            console.log(`Number ${number} pressed in the LIFT ${this.name}`)
        }
        request(this);
    }

    stop() {
        this.run = false;
    }

    run() {
        this.run = true;

        if (this.direction === 'up') {
            this.goUp();
        } else {
            this.goDown();
        }
    }

    goDown() {
        while (this.run && this.floor < MIN_FLOOR) {
            this.floor--;
            request(this);
        }

        this.direction = 'up'

        this.stop();
    }

    goUp() {
        while (this.run && this.floor < MAX_FLOOR) {
            this.floor++;
            request(this);
        }

        this.direction = 'down';

        this.stop();
    }

    turnLightOn() {
        if (!this.working) {
            this.working = true;
            console.log('THE LIGHT IS TURNED ON in ' + this.name + ' LIFT');
        }
    }

    turnLightOff() {
        if (this.working) {
            this.working = false;
            console.log('THE LIGHT IS TURNED OFF in ' + this.name + ' LIFT');
        }
    }

    openTheDoor() {
        if (!this.opened) {
            if (this.pressed.length) {
                const index = this.pressed.indexOf(this.floor);
                if (index > -1) {
                    this.pressed.splice(index, 1);
                }
            }

            this.turnLightOn()

            console.log('THE DOOR IS OPENING FOR LIFT ' + this.name)
            this.opened = true;

            if (typeof this.timerCloseTheDoor === 'function') {
                clearTimeout(this.timerCloseTheDoor);
            }

            let that = this;
            this.timerCloseTheDoor = setTimeout(() => {
                that.closeTheDoor()
            }, 3000)
        }
    }


    closeTheDoor() {
        if (this.opened) {
            console.log('ATTENTION::: THE DOOR IS CLOSING in LIFT ' + this.name);
            this.opened = false;

            if (typeof this.timerTurnOffTheLight === 'function') {
                clearTimeout(this.timerTurnOffTheLight)
            }

            let that = this;
            this.timerTurnOffTheLight = setTimeout(() => {
                if (that.working && !that.run && !directionsUp.length && !directionsDown.length) {
                    that.turnLightOff()
                } else {
                    console.log('that.run', that.run)
                    console.log('hat.working', that.working)
                }

            }, 20000)
        }
    }
}

let LIFT = new Maalit('maalit 1');


let directionsUp = [];
let directionsDown = [];

let buttonsPressedUp = {};
let buttonsPressedDown = {};

var stdin = process.openStdin();

stdin.addListener("data", function (inputData) {
    let info = inputData.toString().trim();
    console.log("you entered: [" + info + "]");
    if (info) {
        pressed_msg(info)
    }
});

function pressed_msg(info) {
    let number = parseInt(info);
    if (!isNaN(number)) {
        pressedLift(number);
        return;
    }

    let inputArr = info.split(',');
    number = parseInt(inputArr[1]);

    if ((inputArr[0] === 'up'
        || inputArr[0] === 'down')
        && !isNaN(number)) {
        pressedFloor({ direction: inputArr[0], floor: parseInt(inputArr[1]) })
        return
    }

    console.log('PROGRAMM ERROR::: Invalid BUTTON');
}

function floor_pressed_msg(direction, floor) {
    console.log(`BUTTON ${direction} pressed on the ${floor} floor`);
    setTimeout(request, 1000);
}

function pressedFloor(params = {}) {
    let { floor, direction } = params;
    let oppositeDirection = direction === 'up' ? 'down' : 'up';
    if (direction === 'up') {
        if (floor < MAX_FLOOR) {
            let index = directionsUp.indexOf(floor)
            if (index === -1) {
                directionsUp.push(floor);
                buttonsPressedUp[floor] = 1;
                floor_pressed_msg(direction, floor);
            }
        } else {
            let index = directionsDown.indexOf(floor)
            if (index === -1) {
                directionsDown.push(floor);
                buttonsPressedDown[floor] = 1;
                floor_pressed_msg(oppositeDirection, floor);
            }
        }
    }
    else if (direction === 'down') {
        if (floor > MIN_FLOOR) {
            let index = directionsDown.indexOf(floor)
            if (index === -1) {
                directionsDown.push(floor);
                buttonsPressedDown[floor] = 1;
                floor_pressed_msg(oppositeDirection, floor);

            } else {
                let index = directionsUp.indexOf(floor)
                if (index === -1) {
                    directionsUp.push(floor);
                    buttonsPressedUp[floor] = 1;
                    floor_pressed_msg(oppositeDirection, floor);
                }
            }
        }

    }

    request();

}

function request(lift) {
    lift = lift || LIFT;

    switch (true) {
        case lift.direction === 'up' && directionsUp.indexOf(lift.floor) > -1:
            lift.stop();
            lift.openTheDoor();
            directionsUp.splice(directionsUp.indexOf(lift.floor), 1);
            delete buttonsPressedUp[lift.floor];
            break;

        case lift.direction === 'down' && directionsDown.indexOf(lift.floor) > -1:
            lift.stop();
            lift.openTheDoor();
            directionsDown.splice(directionsDown.indexOf(lift.floor), 1);
            delete buttonsPressedDown[lift.floor];

            break;
    }
}

function pressedLift(number) {
    LIFT.press(number);
}