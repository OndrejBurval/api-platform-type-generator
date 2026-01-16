import handlebars from "handlebars";
import { keyword } from "esutils";
import BaseGenerator from "./BaseGenerator.js";

export default class TypeGenerator extends BaseGenerator {
  constructor(params) {
    super(params);

    this.registerTemplates(`typescript/`, ["type.ts"]);

    handlebars.registerHelper("isIdentifier", (name) =>
      keyword.isIdentifierES5(name)
    );
  }

  help(resource) {
    console.log(
      'Type for the "%s" resource type has been generated!',
      resource.title
    );
  }

  async generate(api, resource, dir) {
    const dest = `${dir}/types`;
    const { fields, imports } = this.parseFields(resource);

    const normalizeTypeName = (name) => name.replace(/-/g, "_");

    this.createDir(dest, false);
    await this.createFile(
      "type.ts",
      `${dest}/${resource.title.charAt(0).toUpperCase() + resource.title.slice(1).toLowerCase()}.ts`,
      {
        fields,
        imports,
        name: normalizeTypeName(resource.title),
      }
    );
  }

  getDescription(field) {
    return field.description ? field.description.replace(/"/g, "'") : "";
  }

  parseFields(resource) {
    const fields = {};

    for (let field of resource.writableFields) {
      fields[field.name] = {
        notrequired: !field.required,
        name: field.name,
        type: this.getType(field),
        description: this.getDescription(field),
        readonly: false,
        reference: field.reference,
      };
    }

    for (let field of resource.readableFields) {
      if (fields[field.name] !== undefined) {
        continue;
      }

      fields[field.name] = {
        notrequired: !field.required,
        name: field.name,
        type: this.getType(field),
        description: this.getDescription(field),
        readonly: true,
        reference: field.reference,
      };
    }

    // Parse fields to add relevant imports, required for Typescript
    const fieldsArray = Object.keys(fields).map((e) => fields[e]);
    const imports = {};

    for (const field of fieldsArray) {
      if (field.reference) {
        imports[field.type] = {
          type: field.type,
          file: "./" + field.type.toLowerCase(),
        };
      }
    }

    const importsArray = Object.keys(imports).map((e) => imports[e]);

    return { fields: fieldsArray, imports: importsArray };
  }
}
