import { FinanceAssistant } from '@/components/FinanceAssistant'
export function Demo() {
  return (
    <section className="container flex justify-center gap-6 pb-8 pt-6 md:py-10">
      <div className=" min-w-[50vw] max-w-[980px] gap-2  ">
        <FinanceAssistant />
      </div>
    </section>
  )
}
