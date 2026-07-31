import {
  SLOW_REQUEST_DELAY_MS,
  subscribeToSlowRequests,
  trackApiRequest,
} from "lib/api/requestActivity";

const deferred = () => {
  let resolve;
  const promise = new Promise((next) => {
    resolve = next;
  });
  return { promise, resolve };
};

describe("slow API request activity", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("stays hidden for requests shorter than ten seconds", async () => {
    const request = deferred();
    const states = [];
    const unsubscribe = subscribeToSlowRequests((state) => states.push(state));
    const result = trackApiRequest(() => request.promise);

    jest.advanceTimersByTime(SLOW_REQUEST_DELAY_MS - 1);
    request.resolve("done");

    await expect(result).resolves.toBe("done");
    expect(states).toEqual([false]);
    unsubscribe();
  });

  it("shows at ten seconds and hides when the request finishes", async () => {
    const request = deferred();
    const states = [];
    const unsubscribe = subscribeToSlowRequests((state) => states.push(state));
    const result = trackApiRequest(() => request.promise);

    jest.advanceTimersByTime(SLOW_REQUEST_DELAY_MS);
    expect(states).toEqual([false, true]);

    request.resolve("done");
    await expect(result).resolves.toBe("done");
    expect(states).toEqual([false, true, false]);
    unsubscribe();
  });
});
