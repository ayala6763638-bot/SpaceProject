import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/personnel')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/personnel"!</div>
}
