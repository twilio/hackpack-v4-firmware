interface Task {
}
interface Job {
    task: Task;
    context: any;
    arg: any;
    handle: {
        (arg: any): any;
    };
    resolve: {
        (arg: any): any;
    };
    reject: {
        (arg: any): any;
    };
}
interface JobExecutor {
    add(task: Task, context: any, arg: any, errorHandler: any): any;
}
export { Task, Job, JobExecutor };
