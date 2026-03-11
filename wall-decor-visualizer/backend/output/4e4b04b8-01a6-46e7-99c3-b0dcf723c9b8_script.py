OUTPUT_PATH = '/tmp/4e4b04b8-01a6-46e7-99c3-b0dcf723c9b8.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on the provided image dimensions.
    Dimensions used (in feet):
    - Total Wall Height: 9'
    - Total Wall Width: 14'6" (7' opening width + 7'6" solid wall width)
    - Opening Height: 8'
    - Opening Width: 7'
    - Gap above opening: 1' (consistent with 9' total height)
    """
    
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Conversion factor: 1 unit = 1 foot
    wall_width = 14.5  # 14' 6"
    wall_height = 9.0  # 9'
    wall_thickness = 0.5 # Standard 6-inch wall thickness
    
    opening_width = 7.0 # 7'
    opening_height = 8.0 # 8'
    
    # 1. Create the Main Wall Mesh
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall = bpy.context.active_object
    wall.name = "Main_Wall_Skeleton"
    
    # Set dimensions and apply transforms
    wall.dimensions = (wall_width, wall_thickness, wall_height)
    # Position so the bottom-left corner is at (0,0,0)
    wall.location = (wall_width / 2, wall_thickness / 2, wall_height / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 2. Create the Opening (Cutter)
    # This represents the door/window/AC unit area on the left
    bpy.ops.mesh.primitive_cube_add(size=1)
    cutter = bpy.context.active_object
    cutter.name = "Opening_Cutter"
    
    # Make cutter slightly thicker than wall for a clean boolean operation
    cutter.dimensions = (opening_width, wall_thickness * 2, opening_height)
    # Position at the bottom-left of the wall
    cutter.location = (opening_width / 2, wall_thickness / 2, opening_height / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 3. Perform Boolean Subtraction
    bool_mod = wall.modifiers.new(name="Wall_Opening", type='BOOLEAN')
    bool_mod.object = cutter
    bool_mod.operation = 'DIFFERENCE'
    
    # Apply the modifier
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # 4. Clean up: Remove the cutter object
    bpy.data.objects.remove(cutter, do_unlink=True)

    # 5. Export to GLB
    # Headless blender will save this to the current working directory
    bpy.ops.export_scene.gltf(
        filepath='/tmp/4e4b04b8-01a6-46e7-99c3-b0dcf723c9b8.glb', 
        export_format='GLB', 
        use_selection=False
    )

# Execute the function directly
create_wall_skeleton()