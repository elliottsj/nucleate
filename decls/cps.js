declare type CPSCallback<T> = (error: ?Error, result: ?T) => void;
declare type CPSFunction1<A, T> = (arg0: A, callback: CPSCallback<T>) => void;
