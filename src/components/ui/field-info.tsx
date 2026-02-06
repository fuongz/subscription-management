import type { AnyFieldApi } from '@tanstack/react-form'

export function FieldInfo({ field }: { field: AnyFieldApi }) {
  return field.state.meta.isTouched && field.state.meta.errors.length > 0 ? (
    <p className="text-sm text-destructive">
      {field.state.meta.errors.map((e) => (typeof e === 'string' ? e : e.message)).join(', ')}
    </p>
  ) : null
}
