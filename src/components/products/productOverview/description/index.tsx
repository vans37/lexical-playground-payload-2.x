'use client'

import React from 'react'
import { cn } from '../../../../lib/utils'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../ui/accordion'

const ProductDescription = ({
  className,
  description,
  descriptionHtml,
  title = 'Product description',
}: {
  className?: string
  description: React.ReactNode
  descriptionHtml?: string
  title?: string
}) => {
  return (
    <React.Fragment>
      <div className="grid grid-cols-12 gap-4">
        <div className={cn(className, 'col-span-12 lg:col-span-6')}>
          <Accordion className="w-full" collapsible defaultValue="description" type="single">
            <AccordionItem value="description">
              <AccordionTrigger className="max-w-32">Description parsed</AccordionTrigger>
              <AccordionContent>
                <div className="prose lg:prose-xl my-32">{description}</div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        {descriptionHtml?.length > 0 && (
          <div className={cn(className, 'col-span-12 lg:col-span-6')}>
            <Accordion className="w-full" collapsible defaultValue="description_html" type="single">
              <AccordionItem value="description_html">
                <AccordionTrigger className="max-w-32">Description html</AccordionTrigger>
                <AccordionContent>
                  <div className="prose lg:prose-xl my-32">
                    <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </div>
    </React.Fragment>
  )
}

export default ProductDescription
