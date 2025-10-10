import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { Capacitor } from '@capacitor/core'

class FilesystemService {
  async writeFile(
    path: string,
    data: string | Blob,
    directory: Directory = Directory.Data,
    encoding: Encoding = Encoding.UTF8
  ): Promise<string> {
    try {
      let fileData: string

      if (data instanceof Blob) {
        fileData = await this.blobToBase64(data)
      } else {
        fileData = data
      }

      const result = await Filesystem.writeFile({
        path,
        data: fileData,
        directory,
        encoding
      })

      return result.uri
    } catch (error) {
      console.error('Filesystem write error:', error)
      throw new Error(`Failed to write file: ${error}`)
    }
  }

  async readFile(
    path: string,
    directory: Directory = Directory.Data,
    encoding: Encoding = Encoding.UTF8
  ): Promise<string> {
    try {
      const result = await Filesystem.readFile({
        path,
        directory,
        encoding
      })

      return result.data as string
    } catch (error) {
      console.error('Filesystem read error:', error)
      throw new Error(`Failed to read file: ${error}`)
    }
  }

  async deleteFile(
    path: string,
    directory: Directory = Directory.Data
  ): Promise<void> {
    try {
      await Filesystem.deleteFile({
        path,
        directory
      })
    } catch (error) {
      console.error('Filesystem delete error:', error)
      throw new Error(`Failed to delete file: ${error}`)
    }
  }

  async mkdir(
    path: string,
    directory: Directory = Directory.Data,
    recursive: boolean = true
  ): Promise<void> {
    try {
      await Filesystem.mkdir({
        path,
        directory,
        recursive
      })
    } catch (error) {
      console.error('Filesystem mkdir error:', error)
      throw new Error(`Failed to create directory: ${error}`)
    }
  }

  async readdir(
    path: string,
    directory: Directory = Directory.Data
  ): Promise<string[]> {
    try {
      const result = await Filesystem.readdir({
        path,
        directory
      })

      return result.files.map(f => f.name)
    } catch (error) {
      console.error('Filesystem readdir error:', error)
      throw new Error(`Failed to read directory: ${error}`)
    }
  }

  async getUri(
    path: string,
    directory: Directory = Directory.Data
  ): Promise<string> {
    try {
      const result = await Filesystem.getUri({
        path,
        directory
      })

      return result.uri
    } catch (error) {
      console.error('Filesystem getUri error:', error)
      throw new Error(`Failed to get URI: ${error}`)
    }
  }

  async stat(
    path: string,
    directory: Directory = Directory.Data
  ): Promise<any> {
    try {
      return await Filesystem.stat({
        path,
        directory
      })
    } catch (error) {
      console.error('Filesystem stat error:', error)
      throw new Error(`Failed to get file stats: ${error}`)
    }
  }

  async checkPermissions(): Promise<string> {
    try {
      const permissions = await Filesystem.checkPermissions()
      return permissions.publicStorage
    } catch (error) {
      console.error('Error checking filesystem permissions:', error)
      return 'denied'
    }
  }

  async requestPermissions(): Promise<string> {
    try {
      const permissions = await Filesystem.requestPermissions()
      return permissions.publicStorage
    } catch (error) {
      console.error('Error requesting filesystem permissions:', error)
      return 'denied'
    }
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        // Remove data URL prefix
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  isNativePlatform(): boolean {
    return Capacitor.isNativePlatform()
  }
}

export const filesystemService = new FilesystemService()

