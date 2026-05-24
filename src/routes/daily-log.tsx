import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/daily-log')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/daily-log"!</div>
}
