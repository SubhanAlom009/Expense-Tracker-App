import Hero from "@/components/Hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  featuresData,
  howItWorksData,
  statsData,
  testimonialsData,
} from "@/data/landing";
import Image from "next/image";
import Link from "next/link";
export default function Home() {
  return (
    <div className="mt-32">
      <Hero />

      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map((stat, index) => (
              <div key={index} className="my-8 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-lg text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to manage your finance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feature, index) => (
              <Card key={index}>
                <CardContent className="flex flex-col items-center text-center p-6">
                  {feature.icon}
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksData.map((data, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6"
              >
                <div className="bg-blue-100 p-4 rounded-full mb-6 flex items-center justify-center mx-auto w-16 h-16">
                  {data.icon}
                </div>
                <h3 className="text-xl font-semibold mt-4">{data.title}</h3>
                <p className="text-gray-600 mt-2">{data.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            What our users say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialsData.map((userData, index) => (
              <Card key={index}>
                <CardContent className="flex flex-col items-center text-center p-6">
                  <Image
                    src={userData.image}
                    alt={userData.name}
                    width={40}
                    height={40}
                    className="w-12 h-12 rounded-full mb-4"
                  />
                  <h3 className="text-xl font-semibold">{userData.name}</h3>
                  <p className="text-sm text-gray-500">{userData.role}</p>
                  <p className="text-gray-600 mt-4 italic">
                    "{userData.quote}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-white mb-4">
            Ready to take control of your finances?
          </h2>
          <p className="text-lg text-center text-white mb-8">
            join thousands of users who are already managing their
            finances effectively with our AI-powered expense tracker.
          </p>
          <Link href={"/dashboard"}>
            <Button size="lg" className="mx-auto block cursor-pointer bg-white text-blue-600 hover:bg-gray-100 animate-bounce">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
