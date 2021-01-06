import React, { useState } from 'react';
import { arrayOfLength } from '../Utils';
import { Elevator } from './Elevator';
import './Elevator.scss';

interface Props {
    amountOfFloors: number
};

export const ElevatorShaft: React.FC<Props> = ({ amountOfFloors }) => {
    const [elevator, setElevator] = useState<Elevator>(new Elevator(amountOfFloors));

    const handleFloorButtonClick = (e: React.MouseEvent, floorNr: number) => {
        setElevator({
            ...elevator,
            currentFloor: floorNr
        });
    };

    return (
        <div className="elevator">
            {arrayOfLength(amountOfFloors).map((_, floorNr) => {
                const elevatorPresent = elevator.currentFloor === floorNr;

                if (elevatorPresent) {
                    return <ElevatorAtFloor key={floorNr} elevator={elevator} handleFloorButtonClick={handleFloorButtonClick} />;
                } else {
                    return <Floor key={floorNr} number={floorNr} />;
                }
            })}
        </div>
    );
};

interface FloorProps {
    number: number,
    elevatorPresent?: boolean
};

const Floor: React.FC<FloorProps> = ({ number, elevatorPresent = false, children }) => {
    return (
        <div className={`floor ${elevatorPresent ? 'current' : ''}`}>
            <p className="number">{number}</p>
            {children}
        </div>
    );
};

interface ElevatorAtFloorProps {
    elevator: Elevator,
    handleFloorButtonClick: (e: React.MouseEvent, floorNr: number) => void
}

const ElevatorAtFloor: React.FC<ElevatorAtFloorProps> = ({ elevator: { currentFloor, amountOfFloors }, handleFloorButtonClick }) => {
    return (
        <Floor number={currentFloor} elevatorPresent={true}>
            <div className="floor-buttons">
                {arrayOfLength(amountOfFloors).map((_, floorNr) => (
                    <p key={`button-${floorNr}`} onClick={e => handleFloorButtonClick(e, floorNr)}>{floorNr}</p>
                ))}
            </div>
        </Floor>
    );
};
