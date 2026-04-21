/**
 * Business operation with an input and output.
 */
export interface UseCase<Input, Output> {
  execute(input: Input): Output
}

/**
 * Business operation that does not need an input object.
 */
export interface NoInputUseCase<Output> {
  execute(): Output
}

/**
 * Converts values between clean architecture boundaries.
 */
export interface Mapper<Input, Output> {
  map(input: Input): Output
}
