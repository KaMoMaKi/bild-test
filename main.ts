const matrixBreite = 5
const matrixHoehe = 5
const bildPixelAnzahl = matrixBreite * matrixHoehe
const startMarker = 9999
let gespeichertesBild: number[] = []
let empfangenesBild: number[] = []
let empfangAktiv = false

function leseLedMatrix(): number[] {
    let matrix: number[] = []
    for (let y = 0; y < matrixHoehe; y++) {
        for (let x = 0; x < matrixBreite; x++) {
            matrix.push(led.pointBrightness(x, y))
        }
    }
    return matrix
}

function zeigeGespeichertesBild(matrix: number[]): void {
    if (matrix.length !== bildPixelAnzahl) {
        return
    }

    led.enable(false)
    led.stopAnimation()
    led.unplotAll()

    for (let y = 0; y < matrixHoehe; y++) {
        for (let x = 0; x < matrixBreite; x++) {
            const index = y * matrixBreite + x
            led.plotBrightness(x, y, matrix[index])
        }
    }

    led.enable(true)
}

function sendeBildUeberFunk(matrix: number[]): void {
    if (matrix.length !== bildPixelAnzahl) {
        return
    }

    radio.sendNumber(startMarker)
    for (let i = 0; i < matrix.length; i++) {
        radio.sendNumber(matrix[i])
        basic.pause(20)
    }
}

radio.onReceivedNumber(function (receivedNumber) {
    if (receivedNumber == startMarker) {
        empfangAktiv = true
        empfangenesBild = []
    } else if (empfangAktiv) {
        empfangenesBild.push(receivedNumber)
        if (empfangenesBild.length == bildPixelAnzahl) {
            gespeichertesBild = empfangenesBild
            zeigeGespeichertesBild(gespeichertesBild)
            empfangAktiv = false
            basic.showIcon(IconNames.Happy)
            basic.pause(300)
        }
    }
})

input.onButtonPressed(Button.A, function () {
    gespeichertesBild = leseLedMatrix()
    basic.showIcon(IconNames.Yes)
    basic.pause(300)
    zeigeGespeichertesBild(gespeichertesBild)
})

input.onButtonPressed(Button.B, function () {
    zeigeGespeichertesBild(gespeichertesBild)
})

input.onButtonPressed(Button.AB, function () {
    if (gespeichertesBild.length !== bildPixelAnzahl) {
        gespeichertesBild = leseLedMatrix()
    }
    sendeBildUeberFunk(gespeichertesBild)
    basic.showIcon(IconNames.SmallDiamond)
    basic.pause(300)
})

radio.setGroup(23)

basic.showLeds(`
    # . # . #
    . # . # .
    # . # . #
    . # . # .
    # . # . #
    `)
