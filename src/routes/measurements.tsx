import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/measurements')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/measurements"!</div>
}
