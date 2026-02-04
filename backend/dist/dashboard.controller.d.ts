export declare class DashboardController {
    getDashboard(): {
        ok: boolean;
        message: string;
        endpoints: string[];
    };
    getProgress(): {
        status: string;
        progress: {
            shipmentsTotal: number;
            shipmentsDone: number;
            tripsTotal: number;
            tripsInProgress: number;
        };
    };
    getProgressTrips(): {
        status: string;
        trips: never[];
    };
}
