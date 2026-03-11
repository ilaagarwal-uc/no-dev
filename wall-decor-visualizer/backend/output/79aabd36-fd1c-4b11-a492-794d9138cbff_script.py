OUTPUT_PATH = '/tmp/79aabd36-fd1c-4b11-a492-794d9138cbff.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on provided dimensions:
    - Total Wall Height: 9'
    - Total Wall Width: 14'6" (7' + 7'6")
    - Opening (Door/AC area): 7' wide by 8' high, located at the bottom-left.
    """
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Dimensions in feet
    wall_width = 14.5  # 7' + 7'6"
    wall_height = 9.0
    wall_thickness = 0.5  # Standard wall thickness assumption
    
    opening_width = 7.0
    opening_height = 8.0

    # 1. Create the Main Wall block
    # Blender cube size=1 creates a 1x1x1 cube. We scale it to dimensions.
    bpy.ops.mesh.primitive_cube_add(size=1, location=(wall_width / 2, wall_thickness / 2, wall_height / 2))
    wall = bpy.context.active_object
    wall.name = "Main_Wall"
    wall.scale = (wall_width, wall_thickness, wall_height)
    bpy.ops.object.transform_apply(scale=True, location=False, rotation=False)

    # 2. Create the Opening (Cutter) for the door and AC unit area
    # Positioned at the bottom left (x=0 to 7, z=0 to 8)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(opening_width / 2, wall_thickness / 2, opening_height / 2))
    cutter = bpy.context.active_object
    cutter.name = "Opening_Cutter"
    # Make cutter slightly thicker on Y axis to ensure a clean boolean cut
    cutter.scale = (opening_width, wall_thickness * 1.2, opening_height)
    bpy.ops.object.transform_apply(scale=True, location=False, rotation=False)

    # 3. Apply Boolean operation to create the structural opening
    bool_mod = wall.modifiers.new(name="Wall_Opening", type='BOOLEAN')
    bool_mod.object = cutter
    bool_mod.operation = 'DIFFERENCE'
    
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # 4. Remove the cutter object
    bpy.ops.object.select_all(action='DESELECT')
    cutter.select_set(True)
    bpy.ops.object.delete()

    # 5. Export the result to GLB
    # use_selection=False ensures the whole scene (the wall) is exported
    bpy.ops.export_scene.gltf(filepath='/tmp/79aabd36-fd1c-4b11-a492-794d9138cbff.glb', export_format='GLB', use_selection=False)

# Execute the function directly
create_wall_skeleton()