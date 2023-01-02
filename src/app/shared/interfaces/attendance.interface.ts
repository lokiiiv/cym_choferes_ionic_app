

export interface Attendance {
    att_type: string;
    date_created: Date;
}

export interface LastAttendance {
    idAttendance: number;
    att_type: string;
    date_created: Date;
    FK_idUser: number;
}

export interface AllAttendances {
    FK_idUser: number;
    check_in_at: Date;
    check_out_at: Date;
    total_time: Date;
}