"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cities, indicatorDefinitions } from "@/lib/mock-data"
import { BarChart, LineChart, Upload, AlertCircle, Database, Settings, Activity, ArrowLeft, LogOut } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export function AdminView() {
  const [activeTab, setActiveTab] = useState("datasets")
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="container mx-auto py-4 md:py-8 px-4 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="md:hidden">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-xl md:text-2xl font-bold">Admin Dashboard</h1>
        <div className="ml-auto flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1">
            {user?.email || "Admin"}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Platform Management
          </CardTitle>
          <CardDescription>Manage datasets, features, and monitor platform performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="datasets" onValueChange={setActiveTab}>
            <TabsList className="modern-tabs">
              <TabsTrigger value="datasets" className="modern-tab">
                <Database className="h-4 w-4 mr-2" />
                Datasets
              </TabsTrigger>
              <TabsTrigger value="features" className="modern-tab">
                <Settings className="h-4 w-4 mr-2" />
                Features
              </TabsTrigger>
              <TabsTrigger value="analytics" className="modern-tab">
                <Activity className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="datasets" className="space-y-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-base font-medium">City</Label>
                  <Select defaultValue="1">
                    <SelectTrigger className="modern-input">
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">Dataset Type</Label>
                  <Select defaultValue="demographics">
                    <SelectTrigger className="modern-input">
                      <SelectValue placeholder="Select dataset type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="demographics">Demographics</SelectItem>
                      <SelectItem value="economic">Economic</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="mobility">Mobility</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card className="border-dashed border-2 bg-muted/50">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center gap-3 text-center">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium">Drag & Drop Files Here</h3>
                    <p className="text-sm text-muted-foreground">or</p>
                    <Button className="modern-button">Browse Files</Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supported formats: CSV, GeoJSON, XLSX (max 50MB)
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Last update: April 19, 2025</p>
                <Button className="modern-button">Upload Dataset</Button>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-6 py-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-primary flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Available Indicators
                </h3>

                {indicatorDefinitions.map((indicator) => (
                  <div key={indicator.id} className="modern-card flex items-center justify-between">
                    <div>
                      <p className="font-medium">{indicator.name}</p>
                      <p className="text-sm text-muted-foreground">{indicator.description}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-medium text-primary flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Available Features
                </h3>

                <div className="modern-card flex items-center justify-between">
                  <div>
                    <p className="font-medium">Map Visualization</p>
                    <p className="text-sm text-muted-foreground">Interactive map with district highlighting</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="modern-card flex items-center justify-between">
                  <div>
                    <p className="font-medium">Area Comparison</p>
                    <p className="text-sm text-muted-foreground">Compare indicators between two areas</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="modern-card flex items-center justify-between">
                  <div>
                    <p className="font-medium">Data Visualization</p>
                    <p className="text-sm text-muted-foreground">Charts and graphs for data analysis</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="modern-card flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">Natural Language Query</p>
                    <Badge variant="outline" className="text-xs">
                      Beta
                    </Badge>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button className="modern-button">Save Changes</Button>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      Daily Active Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center">
                      <LineChart className="h-16 w-16 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart className="h-4 w-4 text-primary" />
                      Query Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center">
                      <BarChart className="h-16 w-16 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    System Logs
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    Live
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg text-xs overflow-auto h-[200px] font-mono">
                    <p className="text-green-500">2025-04-19 10:15:22 INFO: User login successful (admin)</p>
                    <p className="text-red-500">2025-04-19 10:15:22 ERROR: Dataset upload failed - invalid format</p>
                    <p className="text-green-500">
                      2025-04-19 10:15:22 INFO: New dataset uploaded (Barcelona-Demographics-2025)
                    </p>
                    <p className="text-green-500">2025-04-19 10:14:15 INFO: User viewed Barcelona map</p>
                    <p className="text-green-500">
                      2025-04-19 10:13:45 INFO: User compared Eixample and Gràcia districts
                    </p>
                    <p className="text-green-500">2025-04-19 10:12:30 INFO: System startup complete</p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>System performance: Good</span>
                </div>
                <Button variant="outline">Export Reports</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
