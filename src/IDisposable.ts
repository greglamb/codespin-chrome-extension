export interface IDisposable {
  dispose: () => void;
}

export async function withDisposable<TDisposable extends IDisposable, TResult>(
  getDisposable: () => TDisposable,
  fn: (t: TDisposable) => TResult
): Promise<TResult> {
  const disposable = getDisposable();
  try {
    const result = await fn(disposable);
    disposable.dispose();
    return result;
  } catch (ex: any) {
    disposable.dispose();
    throw ex;
  }
}
