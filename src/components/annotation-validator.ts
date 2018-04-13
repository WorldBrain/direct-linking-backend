import { Annotation } from "../types/annotations";

export type AnnotationValidator = (unvalidatedAnnotation : object) => Promise<Annotation | null>

export const defaultAnnotationValidator : AnnotationValidator = async (unvalidatedAnnotation : object) => {
  return <Annotation>unvalidatedAnnotation // TODO: Implement checking incoming validation
}

export const createDummyAnnotationValidator = ({isAlwaysValid}) : AnnotationValidator => {
  return async (unvalidatedAnnotation) => isAlwaysValid ? <Annotation>unvalidatedAnnotation : null
}
