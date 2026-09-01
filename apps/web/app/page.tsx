"use client";

import { Button } from "@repo/ui/button";
import { IconButton } from "@repo/ui/icon-button";
import { Badge } from "@repo/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@repo/ui/card";
import { FormField, FormLabel, FormHint, FormError } from "@repo/ui/form-field";
import { Input } from "@repo/ui/input";
import { Switch } from "@repo/ui/switch";
import { Separator } from "@repo/ui/separator";
import { Spinner } from "@repo/ui/spinner";
import { Alert, AlertTitle, AlertDescription } from "@repo/ui/alert";
import { Container } from "@repo/ui/container";
import { Stack, Inline } from "@repo/ui/stack";
import { Cross2Icon } from "@radix-ui/react-icons";

export default function Home() {
  return (
    <Container className="py-12">
      <Stack gap="8">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold">YARAPA</h1>
            <p className="mt-1 text-fg-muted">
              Product UI built on the semantic design-token foundation.
            </p>
          </div>
          <Badge tone="brand">UI foundation</Badge>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Form controls compose through FormField for labels, hints and
              errors.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Stack gap="4">
              <FormField>
                <FormLabel htmlFor="email">Email</FormLabel>
                <Input id="email" type="email" placeholder="you@example.com" />
                <FormHint>We never share your email.</FormHint>
              </FormField>
              <FormField>
                <FormLabel htmlFor="password">Password</FormLabel>
                <Input
                  id="password"
                  type="password"
                  aria-invalid
                  aria-describedby="password-error"
                />
                <FormError id="password-error">
                  Password must be at least 8 characters.
                </FormError>
              </FormField>
              <Inline gap="3">
                <Switch id="remember" defaultChecked />
                <FormLabel htmlFor="remember">Keep me signed in</FormLabel>
              </Inline>
            </Stack>
          </CardContent>
          <CardFooter>
            <Button>Sign in</Button>
            <Button variant="ghost">Forgot password?</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System status</CardTitle>
            <CardDescription>Feedback components with semantic tones.</CardDescription>
          </CardHeader>
          <CardContent>
            <Stack gap="4">
              <Alert tone="success">
                <AlertTitle>All systems operational</AlertTitle>
                <AlertDescription>Last checked 2 minutes ago.</AlertDescription>
              </Alert>
              <Alert tone="warning" role="alert">
                <AlertTitle>Scheduled maintenance</AlertTitle>
                <AlertDescription>Sunday 02:00–03:00 (GMT+7).</AlertDescription>
              </Alert>
            </Stack>
          </CardContent>
          <CardFooter>
            <Button variant="outline">
              <Spinner className="size-4" />
              Refreshing…
            </Button>
          </CardFooter>
        </Card>

        <section>
          <h2 className="text-xl font-semibold">Component states</h2>
          <Separator className="my-4" />
          <Inline gap="3" wrap>
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg" variant="outline">
              Large outline
            </Button>
            <Button variant="danger" disabled>
              Danger disabled
            </Button>
            <IconButton aria-label="Dismiss notification">
              <Cross2Icon />
            </IconButton>
            <Badge tone="success">Passing</Badge>
          </Inline>
        </section>
      </Stack>
    </Container>
  );
}
