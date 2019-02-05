# Description
The extension extracts a version number based on Semantic Versioning (https://semver.org/) from a JSON or XML file.
Output variables will be set so that the version number can be used in subsequent tasks.

If the extension fails to find a Major, Minor or Patch component, it will fail. Make sure they exist in the file and if they do not match the expected names (*Prefix, Major, Minor, Patch, Suffix*), please set the corresponding input.
Though the extension supports both a prefix and a suffix, they are entirely optional and can safely be omitted.

#  Usage
| Input | Description |
| ------ | ------ |
| **Version file** | **[MANDATORY] The path to the version file. Extension is irrelevant but it must be encoded in UTF-8 and consist of JSON or XML.**|
| Output format | The format of the output. Use {prefix}, {major}, {minor}, {patch} and {suffix} to refer to the respective parts of the version. |
| Prefix name | Set this if you use a different term for 'Prefix'. |
| Major name | Set this if you use a different term for 'Major'. |
| Minor name | Set this if you use a different term for 'Minor'. |
| Patch name | Set this if you use a different term for 'Patch'. |
| Suffix name | Set this if you use a different term for 'Suffix'. |

&nbsp;

| Output variable | Description |
| ------ | ------ |
| Prefix | The prefix component of the version. |
| Major | The major component of the version. |
| Minor | The minor component of the version. |
| Patch | The patch component of the version. |
| Suffix | The suffix component of the version. |
| Version | The full version. |

&nbsp;

The extension allows you to override any component of the version for a specific build using variables.

| Build variable | Description |
| ------ | ------ |
| Prefix | Overrides the prefix component of the version for the build. |
| Major | Overrides the major component of the version for the build. |
| Minor | Overrides the minor component of the version for the build. |
| Patch | Overrides the patch component of the version for the build. |
| Suffix | Overrides the suffix component of the version for the build. |

# Example
Version file (e.g. version.txt):
```json
{
    "Pre": "V",
    "Major": 1,
    "Minor": 0,
    "Patch": 1,
    "Post": "-master"
}
```
or
```xml
<Version>
  <Pre>V</Pre>
  <Major>1</Major>
  <Minor>0</Minor>
  <Patch>1</Patch>
  <Post>-master</Post>
</Version>
```

Say we want the full version to look like this: ***V_1.0.1-master***.
We simply have to set these inputs:
- File = version.txt
- Prefix name = Pre
- Suffix name = Post
- Output format = {prefix}_{major}.{minor}.{patch}{suffix}
