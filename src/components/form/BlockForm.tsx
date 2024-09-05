'use client'
import type { ReactNode } from 'react'
import type { Props as InputMaskProps } from 'react-input-mask'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import InputMask from 'react-input-mask'
import { z } from 'zod'

import { Button } from '../ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { useToast } from '../ui/use-toast'
import { createOrder } from '../../actions/order'

type InputMaskCorrect = Omit<InputMaskProps, 'children'> & {
  children?: (inputProps: any) => JSX.Element
}

const InputMaskCorrect: React.FC<InputMaskCorrect> = ({ children, ...props }) => {
  return <InputMask {...props}>{children as unknown as ReactNode}</InputMask>
}

const formSchema = z.object({
  client_message: z.string().optional(),
  client_phone: z.string(),
  client_name: z
    .string()
    .min(2, {
      message: 'Name is too short',
    })
    .max(50, {
      message: 'Name is too long',
    })
    .regex(/^[a-zA-Z\s]+$/, {
      message: 'Only latin characters and spaces',
    }),
})

export default function BlockForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      client_message: '',
      client_phone: '',
      client_name: '',
    },
    resolver: zodResolver(formSchema),
  })

  const { toast } = useToast()

  // 2. Define a submit handler.
  const submit: () => void = form.handleSubmit(async (values: z.infer<typeof formSchema>) => {
    toast({
      title: 'Success',
      description: 'Thanks for contacting us, wait till we call you back!',
    })
    const response = await createOrder(
      values.client_name,
      values.client_phone,
      values.client_message,
    )

    if (response == 200) {
      toast({
        title: 'Success',
        description: 'Thanks for contacting us, wait till we call you back!',
      })
      form.reset()
    } else {
      toast({
        title: 'Error',
        description: 'Try again later please',
        variant: 'destructive',
      })
    }
  })

  return (
    <Form {...form}>
      <form
        onSubmit={e => {
          e.preventDefault()
          submit()
        }}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="client_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Name<span className="text-red-700"> *</span>
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="client_phone"
          render={({ field }) => (
            <InputMaskCorrect mask="+1(999)999-99-99" {...field}>
              {({ inputProps }: any) => (
                <FormItem>
                  <FormLabel>
                    Phone number<span className="text-red-700"> *</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...inputProps} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            </InputMaskCorrect>
          )}
        />

        <FormField
          control={form.control}
          name="client_message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea className="max-h-96" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <p className="text-xs max-w-xl">
          Fields marked <span className="text-red-700"> * </span>are required
        </p>
        <p className="text-xs max-w-xl">
          Agree{' '}
          <a className="text-indigo-400" href="/confidentiality">
            to terms and conditions
          </a>
        </p>
        <Button className="bg-indigo-600" type="submit">
          Send
        </Button>
      </form>
    </Form>
  )
}
